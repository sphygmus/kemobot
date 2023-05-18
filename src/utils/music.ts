import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, InteractionEditReplyOptions, MessageCreateOptions, TextChannel, VoiceChannel } from "discord.js";
import { search } from "youtube-search-without-api-key";
import ytdl from "ytdl-core";

import Discord from "../discord";
import { getGuilds, updateGuildData } from "./guilds";

enum LoopType {
	None,
	Once,
	Song,
	Playlist
}

const queue: GuildMusicData[] = [];

const getUser = async (userID: string) => {
	const user = await Discord.users.fetch(userID);
	return user;
}

const skipSong = async (guildID: string, stop = false) => {
	const guildIndex = getGuildIndex(guildID);

	if (stop) {
		queue[guildIndex].queue = [];
		queue[guildIndex].looping = LoopType.None;
	}

	if (queue[guildIndex].queue.length > 0) {
		switch (queue[guildIndex].looping) {
			case LoopType.Once:
				queue[guildIndex].looping = LoopType.None;
				break;
			case LoopType.Song:
				break;
			case LoopType.Playlist:
				const song = queue[guildIndex].queue[0];
				queue[guildIndex].queue.push(song);
				queue[guildIndex].queue.splice(0, 1);
				break;
			default:
				queue[guildIndex].queue.splice(0, 1);
		}
	}

	await playNextSong(guildID);
}

const toggleSong = (guildID: string) => {
	const guildIndex = getGuildIndex(guildID);
	const guildQueue = queue[guildIndex];

	const player = guildQueue.player;
	if (player) {
		const playing = player.state.status === AudioPlayerStatus.Playing;
		player[playing ? "pause" : "unpause"]();
	}
}

const loopingText = [
	"None",
	"Once",
	"Single",
	"Playlist"
]

const toggleLoop = async (guildID: string) => {
	const guildIndex = getGuildIndex(guildID);
	queue[guildIndex].looping = (queue[guildIndex].looping + 1) % loopingText.length;
	await showPlayerInterface(guildID);
}

const interfaceObject = async (guildID: string) => {
	const guildIndex = getGuildIndex(guildID);
	const guildQueue = queue[guildIndex];
	const playing = guildQueue.player?.state.status === AudioPlayerStatus.Playing;

	const currentSong = guildQueue.queue.length > 0 ? guildQueue.queue[0] : null;
	const requester = currentSong ? await getUser(currentSong.requestedBy) : null;
	const requestAvatar = requester ? requester.avatarURL({ extension: "png", size: 64 }) : null;

	const description = currentSong ?
		`**${currentSong.title + "\u200B ".repeat(25)}**` :
		"There are no songs in queue.";

	const fields: APIEmbedField[] = guildQueue.queue.length > 1 ? [{
		name: "\u200B ".repeat(4) + "Next in queue:",
		value: `*${guildQueue.queue[1].title} (Requested by: ${(await getUser(guildQueue.queue[1].requestedBy)).username})*`
	}] : [];

	const embed = new EmbedBuilder()
		.setColor(Colors.Gold)
		.setTitle(`Currently ${playing ? "playing" : "paused"}`)
		.setURL(currentSong ? currentSong.url : null)
		.setDescription(description)
		.setThumbnail(currentSong ? currentSong.thumbnail : null)
		.setFooter(requester ? { text: `Requested by ${requester.username}`, iconURL: requestAvatar || undefined } : null)
		.setTimestamp(currentSong ? currentSong.requestTime : null)
		.setFields(fields)

	const buttonOptions = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("btn-music-add")
				.setLabel("Add Songs")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("btn-music-toggle")
				.setLabel(playing ? "Pause" : "Play")
				.setStyle(playing ? ButtonStyle.Success : ButtonStyle.Danger)
				.setDisabled(guildQueue.queue.length === 0),
			new ButtonBuilder()
				.setCustomId("btn-music-loop")
				.setLabel(`Loop: ${loopingText[guildQueue.looping]}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(guildQueue.queue.length === 0),
			new ButtonBuilder()
				.setCustomId("btn-music-queue")
				.setLabel("Queue" + (guildQueue.queue.length > 1 ? `: ${guildQueue.queue.length}` : ""))
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(guildQueue.queue.length < 2),
			new ButtonBuilder()
				.setCustomId("btn-music-skip")
				.setLabel("Skip")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(guildQueue.queue.length < 2),
		)

	return <InteractionEditReplyOptions>{
		embeds: [embed],
		components: [buttonOptions]
	};;
}

const showPlayerInterface = async (guildID: string, channelID?: string) => {
	let savedGuildData = getGuilds(guildID)[0];
	const musicData = savedGuildData.music;
	let create = false;

	if (!musicData.channelID || !musicData.messageID)
		create = true;

	if (channelID && channelID !== musicData.channelID)
		create = true;

	const playerInterface = await interfaceObject(guildID);
	const guildData = await Discord.guilds.fetch(guildID);

	if (musicData.channelID) {
		try {
			const channel = await guildData.channels.fetch(musicData.channelID) as TextChannel;
			const messages = await channel.messages.fetch();

			const lastMessage = messages.first();
			if (lastMessage?.id !== musicData.messageID) {
				create = true;
				channelID = musicData.channelID;
			}
		} catch (err) {
			create = true;
		}
	}

	const updateOldInterface = async (deleteInterface = false) => {
		if (!musicData.channelID || !musicData.messageID)
			return;

		const channel = await guildData.channels.fetch(musicData.channelID) as TextChannel | null;
		if (channel) {
			try {
				const oldInterface = await channel.messages.fetch(musicData.messageID);

				if (deleteInterface && oldInterface.deletable) {
					await oldInterface.delete();
					return;
				}

				await oldInterface.edit(playerInterface);
			} catch (err) {
				console.warn("> [Discord] Previous player interface was not found. Recreating a new interface.");
				return;
			}
		}
	}

	if (create && channelID) {
		await updateOldInterface(true);
		const channel = await guildData.channels.fetch(channelID) as TextChannel | null;
		if (channel) {
			const newInterface = await channel.send(playerInterface as MessageCreateOptions);

			savedGuildData.music = {
				channelID,
				messageID: newInterface.id
			}

			updateGuildData(guildID, savedGuildData);
		}
	} else {
		await updateOldInterface();
	}
}

const getGuildIndex = (guildID: string) => {
	let guildQueueIndex = queue.findIndex(data => data.guildID === guildID);

	if (guildQueueIndex < 0) {
		queue.push({
			guildID,
			looping: LoopType.None,
			queue: []
		});

		guildQueueIndex = queue.length - 1;
	}

	return guildQueueIndex;
}

const addToQueue = async (guildID: string, video: string, requestedBy: string, slash = false) => {
	const guildQueue = getGuildIndex(guildID);

	const songInput = video.split("\n").filter(song => song.length > 1);
	for (const songString of songInput) {
		const searchResults = await search(songString);
		const song = searchResults[0];

		queue[guildQueue].queue.push({
			url: song.url,
			title: song.title,
			duration: song.snippet.duration,
			thumbnail: song.snippet.thumbnails.url,
			requestedBy,
			requestTime: Date.now()
		});

		if (queue[guildQueue].queue.length === 1) {
			await playNextSong(guildID, slash);
		}
	}

	await showPlayerInterface(guildID);
}

const getGuildMusicData = (guildID: string) => {
	const guildQueue = getGuildIndex(guildID);
	return queue[guildQueue];
}

const attemptJoinChannel = async (guildID: string, slash = false) => {
	const guildQueue = getGuildIndex(guildID);
	const memberIDs = queue[guildQueue].queue.filter((song, index, self) => self.indexOf(song) === index).map(song => song.requestedBy);
	const guildData = await Discord.guilds.fetch(guildID);

	for (const member of memberIDs) {
		const memberData = await guildData.members.fetch(member);
		if (memberData.voice.channel) {
			const connection = joinVoiceChannel({
				channelId: memberData.voice.channel.id,
				guildId: guildID,
				adapterCreator: guildData.voiceAdapterCreator
			});

			const player = createAudioPlayer();
			connection.subscribe(player);

			queue[guildQueue].player = player;
			queue[guildQueue].playingIn = memberData.voice.channel.id;

			player.on("stateChange", async (oldState, newState) => {
				if (newState.status === AudioPlayerStatus.Idle) {
					await skipSong(guildID);
				}

				if ([AudioPlayerStatus.Idle, AudioPlayerStatus.Paused, AudioPlayerStatus.Playing].includes(newState.status)) {
					await showPlayerInterface(guildID);
				}
			});

			connection.on("stateChange", async (oldState, newState) => {
				if ([VoiceConnectionStatus.Destroyed, VoiceConnectionStatus.Disconnected].includes(newState.status)) {
					queue[guildQueue] = {
						guildID,
						looping: LoopType.None,
						queue: []
					}

					await showPlayerInterface(guildID);
				}
			})

			await playNextSong(guildID, slash);
			break;
		}
	}
}

const checkUsersInVoice = async (guildID: string, userID?: string) => {
	const guildQueue = getGuildIndex(guildID);
	const voiceChannelID = queue[guildQueue].playingIn;

	if (!voiceChannelID)
		return false;

	const guildData = await Discord.guilds.fetch(guildID);
	const voiceChannel = await guildData.channels.fetch(voiceChannelID) as VoiceChannel | null;

	if (voiceChannel) {
		if (userID) {
			const userInChannel = voiceChannel.members.find(user => user.id === userID);
			return userInChannel !== undefined;
		}

		const botsInChannel = voiceChannel.members.filter(members => members.user.bot).size;
		const usersInChannel = voiceChannel.members.size - botsInChannel;
		return usersInChannel > 0;
	}

	return false;
}

const playNextSong = async (guildID: string, slash = false) => {
	const connection = getVoiceConnection(guildID);
	if (!connection) {
		await attemptJoinChannel(guildID, slash);
		return;
	}

	const guildQueue = getGuildIndex(guildID);
	const guildData = queue[guildQueue];
	const usersInChannel = await checkUsersInVoice(guildID);

	if (usersInChannel && (guildData.queue.length > 0 || guildData.looping !== LoopType.None)) {
		const nextInQueue = guildData.queue[0];
		const player = queue[guildQueue].player;

		if (player) {
			// const quality = process.env.DEV ? "lowestaudio" : "highestaudio";
			const stream = ytdl(nextInQueue.url, { filter: "audioonly", quality: "lowestaudio" });
			const resource = createAudioResource(stream);
			player.play(resource);
		}
	} else {
		connection.destroy();
		queue[guildQueue].player = undefined;
		queue[guildQueue].playingIn = undefined;
	}

	if (!slash)
		await showPlayerInterface(guildID);
}

export { addToQueue, checkUsersInVoice, getGuildMusicData, getUser, showPlayerInterface, skipSong, toggleLoop, toggleSong, LoopType }
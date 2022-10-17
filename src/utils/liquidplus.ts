import fs from "fs";
import path from "path";
import axios from "axios";

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, MessageReplyOptions } from "discord.js";
import Twitch from "../twitch";
import { getFatherDMChannel } from "./messages";

const DATA_PATH = path.resolve(__dirname, "../data/liquidplus.json");

const getExistingData = () => {
	const response = fs.readFileSync(DATA_PATH, "utf-8");
	const data = JSON.parse(response) as LiquidPlusData;
	return data;
}

const saveLiquidPlusData = (data: LiquidPlusData) => {
	fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4));
}

const getLiquidStreams = async () => {
	try {
		const localData = getExistingData();
		const matchesResponse = await axios.get("https://liquidplus.com/twitch/events/schedule");
		const streamResponse = await axios.get("https://liquidplus.com/twitch/streamers/live");

		const matches = matchesResponse.data.data as MatchData[];
		const streams = streamResponse.data.data as StreamData[];

		const prioritized: Prioritized = {
			high: [],
			regular: [],
			low: []
		};

		for (const match of matches) {
			if (match.started && match.channel_name.length > 0 && !prioritized.regular.includes(match.channel_name.toLowerCase()))
				prioritized.regular.push(match.channel_name.toLowerCase());
		}

		for (const stream of streams) {
			if (!prioritized.regular.includes(stream.name.toLowerCase()))
				prioritized.low.push(stream.name.toLowerCase());
		}

		for (const stream of localData.prioritized) {
			if (!prioritized.high.includes(stream) && (prioritized.regular.includes(stream) || prioritized.low.includes(stream))) {
				const willRemoveFrom = prioritized.regular.includes(stream) ? prioritized.regular : prioritized.low;
				prioritized.high.push(stream);
				willRemoveFrom.splice(willRemoveFrom.indexOf(stream), 1);
			}
		}

		return prioritized;
	} catch (err) {
		console.log(`> [Local] There was an error while updating Liquid+ streams.\n${err}`);
		return null;
	}
}

const chooseRandomStream = async (current: string[], amount: number = 2) => {
	try {
		const streams = await getLiquidStreams();
		const chosen = [];

		if (streams) {
			for (const data in streams) {
				const stream = streams[data as keyof Prioritized];
				let streamIndex = stream.length;
				while (streamIndex--) {
					if (current.includes(stream[streamIndex]))
						stream.splice(stream.indexOf(stream[streamIndex]), 1);
				}
			}

			while (amount--) {
				const prioType = streams.high.length > 0 ? streams.high : (streams.regular.length > 0 ? streams.regular : streams.low);
				const randomStream = Math.floor(Math.random() * prioType.length);
				const stream = prioType[randomStream];
				prioType.splice(randomStream, 1);
				chosen.push(stream);
			}
		}

		return chosen;
	} catch (err) {
		console.log(`> [Twitch] There was an error while choosing random Liquid streams.\n${err}`);
		return [];
	}
}

const checkAndUpdateStreams = async () => {
	const liquidData = getExistingData();
	const streamData = liquidData.streamData;
	const streams = await getLiquidStreams();
	const safeStreams: string[] = [];

	if (streams == null)
		return;

	if (streams.high.length > 0) {
		for (const stream of streams.high) {
			const isSafe = streamData.streams.includes(stream);
			if (isSafe || safeStreams.length < 2)
				safeStreams.push(stream);
		}
	}

	if (streams.regular.length > 0) {
		for (const stream of streams.regular) {
			const isSafe = streamData.streams.includes(stream);
			if (isSafe && safeStreams.length < 2)
				safeStreams.push(stream);
		}
	}

	for (const stream of streamData.streams) {
		if (streams.high.includes(stream) || streams.regular.includes(stream) || streams.low.includes(stream)) {
			if (!safeStreams.includes(stream) && safeStreams.length < 2)
				safeStreams.push(stream);
		}
	}

	let streamIndex = streamData.streams.length;
	while (streamIndex--) {
		if (!safeStreams.includes(streamData.streams[streamIndex])) {
			await Twitch.part(streamData.streams[streamIndex]).catch(err => console.log(err));
			streamData.streams.splice(streamIndex, 1);
		}
	}

	if (streamData.streams.length < 2) {
		const newStreams = await chooseRandomStream(streamData.streams, 2 - streamData.streams.length);
		for (const stream of newStreams) {
			if (!streamData.streams.includes(stream)) {
				await Twitch.join(stream).catch(err => console.log(err));
				streamData.streams.push(stream);
			}
		}

		liquidData.streamData.lastUpdate = Date.now();
		saveLiquidPlusData(liquidData);
		await updateLiquidInterface();
	}
}

const updateLiquidInterface = async () => {
	const liquidPlusData = getExistingData();
	const streamData = liquidPlusData.streamData;

	const currentStreams = streamData.running && streamData.streams.length > 0 ? streamData.streams.join(", ") : "No-one";
	const prioritizedStreams = liquidPlusData.prioritized.length > 0 ? liquidPlusData.prioritized.join(", ") : "No-one";

	const embed = new EmbedBuilder()
		.setColor(Colors.Gold)
		.setTitle("Liquid+ Interface")
		.setDescription("The new way to monitor and update Liquid+ settings. It is all thanks to *you*, father. **You are amazing.**")
		.setThumbnail("attachment://liquidpluslogo.png")
		.addFields(
			{ name: "Current streams", value: currentStreams, inline: false },
			{ name: "Prioritized streams", value: prioritizedStreams, inline: false }
		)
		.setFooter({ text: "Last update", iconURL: "attachment://liquidpluslogo.png" })
		.setTimestamp(streamData.lastUpdate)

	const buttonOptions = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("btn-lqdplus-link")
				.setLabel("Liquid+")
				.setStyle(ButtonStyle.Link)
				.setURL("https://liquidplus.com/"),
			new ButtonBuilder()
				.setCustomId("btn-refresh-streams")
				.setLabel("Refresh")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(!streamData.running),
			new ButtonBuilder()
				.setCustomId("btn-update-prio")
				.setLabel("Update Prioritized Streams")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId("btn-toggle-twitch")
				.setLabel("Toggle")
				.setStyle(streamData.running ? ButtonStyle.Success : ButtonStyle.Danger)
		)

	const message: MessageReplyOptions = {
		embeds: [embed],
		components: [buttonOptions],
		files: [path.resolve(__dirname, "../assets/liquidpluslogo.png")]
	};

	const dmChannel = await getFatherDMChannel();
	try {
		if (liquidPlusData.interface) {
			const interfaceMessage = await dmChannel.messages.fetch(liquidPlusData.interface);
			interfaceMessage.edit(message);
		}
	} catch (e) {
		const newInterface = await dmChannel.send(message);
		liquidPlusData.interface = newInterface.id;
		saveLiquidPlusData(liquidPlusData);
	}
}

export { checkAndUpdateStreams, chooseRandomStream, getExistingData, getLiquidStreams, saveLiquidPlusData, updateLiquidInterface }
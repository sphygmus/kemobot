import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

import { checkUsersInVoice, getGuildMusicData, getUser, skipSong, toggleLoop, toggleSong } from "../../utils/music";
import { splitInteractionID } from "../../utils/commands";

type ButtonType = "add" | "loop" | "queue" | "skip" | "toggle";

export default <ButtonAction>{
	id: "btn-music",
	exec: async interaction => {
		if (!interaction.guild) {
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply("You need to be in a server to use this command.");
			return;
		}

		const userInChannel = await checkUsersInVoice(interaction.guild.id, interaction.user.id);
		const memberData = await interaction.guild.members.fetch(interaction.user.id);
		const guildData = getGuildMusicData(interaction.guild.id);
		const botInChannel = guildData.playingIn !== undefined;

		let response = "You need to be in a voice channel to use this command.";
		let errorCheck = false;

		if (botInChannel) {
			if (!userInChannel) {
				response = "You need to be in the bot's voice channel to use this command.";
				errorCheck = true;
			}
		} else {
			if (!memberData.voice.channel)
				errorCheck = true;
		}

		if (errorCheck) {
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply(response);
			return;
		}

		const ids = splitInteractionID(interaction.customId);
		const buttonType = ids[2] as ButtonType;

		if (["loop", "skip", "toggle"].includes(buttonType)) {
			await interaction.deferReply();
			await interaction.deleteReply();
		}

		switch (buttonType) {
			case "add":
				const modal = new ModalBuilder()
					.setCustomId("modal-add-song")
					.setTitle("Queue Songs");

				const addSongInput = new TextInputBuilder()
					.setCustomId("input-add-song")
					.setLabel("Enter the songs you want to add to the queue.")
					.setPlaceholder("Seperate multiple entries with new lines...")
					.setStyle(TextInputStyle.Paragraph);

				const addSongActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(addSongInput);
				modal.addComponents(addSongActionRow);
				await interaction.showModal(modal);
				return;
			case "loop":
				await toggleLoop(interaction.guild.id);
				break;
			case "queue":
				await interaction.deferReply({ ephemeral: true });

				const songs = await Promise.all(guildData.queue.slice(0, 5).map(async (song, i, self) => {
					const user = await getUser(song.requestedBy);
					return `${i + 1}. ${song.title}\n\t(Requested by: ${user.username})${i + 1 !== self.length ? "\n" : ""}`;
				}));

				await interaction.editReply("**Next 5 songs in the queue:**```" + songs.join("\n") + "```");
				return;
			case "skip":
				await skipSong(interaction.guild.id);
				break;
			case "toggle":
				toggleSong(interaction.guild.id);
				break;
		}
	}
}
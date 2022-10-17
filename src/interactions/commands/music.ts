import { SlashCommandBuilder } from "discord.js";
import { addToQueue, showPlayerInterface } from "../../utils/music";

// https://github.com/fent/node-ytdl-core/issues/994

const config = new SlashCommandBuilder()
	.setName("music")
	.setDescription("Shows the music player interface.")
	.setDMPermission(false)
	.addStringOption(option => option
		.setName("add")
		.setDescription("Add a song to the queue.")
	)

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.reply("*Rebuilding the music player interface...*");

		if (interaction.guild) {
			const newSong = interaction.options.getString("add");
			if (newSong)
				await addToQueue(interaction.guild.id, newSong, interaction.user.id, true);
			else
				await showPlayerInterface(interaction.guild.id, interaction.channelId);
		}

		await interaction.deleteReply();
	}
}
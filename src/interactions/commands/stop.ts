import { SlashCommandBuilder } from "discord.js";
import { skipSong } from "../../utils/music";

const config = new SlashCommandBuilder()
	.setName("stop")
	.setDescription("Stops the music playback.")

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.reply("*Stops the music playback...*");
		await interaction.deleteReply();

		if (interaction.guildId)
			await skipSong(interaction.guildId, true);
	}
}
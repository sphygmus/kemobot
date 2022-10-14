import { SlashCommandBuilder } from "discord.js";

const config = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Replies with pong.")

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		const startTime = Date.now();
		await interaction.deferReply({ ephemeral: true });
		await interaction.editReply({ content: `Pong! (${Date.now() - startTime}ms)` });
	}
}
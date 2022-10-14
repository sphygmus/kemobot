import { SlashCommandBuilder } from "discord.js";

const config = new SlashCommandBuilder()
	.setName("command_name")
	.setDescription("command_description")

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });
		await interaction.editReply({ content: `interaction_reply` });
	}
}
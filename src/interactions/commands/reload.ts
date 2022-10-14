import { SlashCommandBuilder } from "discord.js";

const config = new SlashCommandBuilder()
	.setName("reload")
	.setDescription("Reloads application interactions.")
	.setDefaultMemberPermissions("0")

export default <DiscordCommand>{
	config,
	minimumRank: 10,
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });
		interaction.client.emit("reload");
		await interaction.editReply({ content: "Reloading application data." });
	}
}
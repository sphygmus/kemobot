import { SlashCommandBuilder } from "discord.js";
import { updateLiquidInterface } from "../../utils/liquidplus";

const config = new SlashCommandBuilder()
	.setName("lqd")
	.setDescription("Shows Liquid+ command interface.")
	.setDefaultMemberPermissions("0")

export default <DiscordCommand>{
	config,
	minimumRank: 10,
	exec: async interaction => {
		await interaction.reply("*Loading Liquid+ command interface...*");
		await interaction.deleteReply();
		await updateLiquidInterface();
	}
}
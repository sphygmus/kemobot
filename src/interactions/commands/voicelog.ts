import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getDate, getDuration, getTime } from "../../utils/date";
import { getGuildVoiceData } from "../../utils/voicelog";

const config = new SlashCommandBuilder()
	.setName("voicelog")
	.setDescription("Shows the voice channel log of the server.")
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
	.addUserOption(user => user
		.setName("user")
		.setDescription("Choose a user to get the voice log of."))

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });
		const user = interaction.options.getUser("user");

		const voiceLogs = getGuildVoiceData();
		const guildData = voiceLogs.find(logs => logs.guildID === interaction.guildId);

		let logText = `Latest voice logs of **${user ? `<@${user.id}>` : interaction.guild?.name}**:\n`;
		let logData: VoiceData[];

		if (guildData) {
			const user = interaction.options.getUser("user");
			if (user) {
				const userLogs = guildData.logs.filter(log => log.userID === user.id);
				if (userLogs.length === 0) {
					await interaction.editReply({ content: `This user has no voice logs in this server.` });
					return;
				}

				logData = userLogs;
			} else {
				logData = guildData.logs;
			}
		} else {
			await interaction.editReply({ content: `This server has no voice logs yet.` });
			return;
		}

		const lastTenLogs = logData.slice(-10);
		const logDataText = lastTenLogs.map((log, index) => {
			const member = interaction.client.users.cache.get(log.userID);
			const userName = member?.tag || "Unknown";
			const duration = log.before !== "(undefined)" && lastTenLogs[index - 1] ? ` (${getDuration(log.time - lastTenLogs[index - 1].time)})` : "";
			return `${userName} - ${log.before} --> ${log.after} - ${getDate(log.time)} @ ${getTime(log.time) + duration}`;
		});
		await interaction.editReply({ content: logText + "```" + logDataText.join("\n") + "```" });
	}
}
import { ActionRowBuilder, ButtonBuilder, Colors, EmbedBuilder, MessagePayload, SlashCommandBuilder, WebhookEditMessageOptions } from "discord.js";
import { getDate, getTime } from "../../utils/date";
import { getAllReminders } from "../../utils/timer";

const config = new SlashCommandBuilder()
	.setName("list")
	.setDescription("List some of the functionalities of Kemobot.")
	.addStringOption(option => option
		.setName("type")
		.setDescription("Choose a functionality to view settings.")
		.setRequired(true)
		.addChoices(
			{ name: "reminders", value: "reminders" }
		)
	)

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		const reply = await interaction.deferReply({ ephemeral: true });

		const listType = interaction.options.getString("type") as "reminders";
		const whiteSpace = "\u200B ".repeat(4);
		let response: string | MessagePayload | WebhookEditMessageOptions = "";
		switch (listType) {
			case "reminders":
				const reminders = getAllReminders().filter(reminder => reminder.userID === interaction.user.id);
				const reminderListTexts = reminders.map((reminder, index) => {
					const setDate = getDate(reminder.startTime);
					const setTime = getTime(reminder.startTime);
					const targetDate = getDate(reminder.targetTime);
					const targetTime = getTime(reminder.targetTime);
					return `**${index + 1}. ${reminder.description}**\n*${whiteSpace}Set at: ${setDate}, ${setTime}\n${whiteSpace}Will be fired at: ${targetDate}, ${targetTime})*`;
				});

				const embed = new EmbedBuilder({
					title: `You have set ${reminderListTexts.length} reminder${reminderListTexts.length > 1 ? "s" : ""}.`,
					description: reminderListTexts.join("\n"),
					color: Colors.Gold
				});

				response = { embeds: [embed] }
				break;
		}

		await interaction.editReply(response);
	}
}
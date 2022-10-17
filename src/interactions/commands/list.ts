import { ActionRowBuilder, Colors, EmbedBuilder, MessagePayload, SelectMenuBuilder, SlashCommandBuilder, WebhookEditMessageOptions } from "discord.js";
import { getDate, getTime } from "../../utils/date";
import { getUserReminders } from "../../utils/timer";

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
		await interaction.deferReply({ ephemeral: true });

		const listType = interaction.options.getString("type") as "reminders";
		const whiteSpace = "\u200B ".repeat(4);
		let response: string | MessagePayload | WebhookEditMessageOptions = "";
		switch (listType) {
			case "reminders":
				const reminders = getUserReminders(interaction.user.id);
				const reminderListTexts = reminders.map((reminder, index) => {
					const setDate = getDate(reminder.startTime);
					const setTime = getTime(reminder.startTime);
					const targetDate = getDate(reminder.targetTime);
					const targetTime = getTime(reminder.targetTime);
					return `**${index + 1}. ${reminder.description}**\n*${whiteSpace}Set at: ${setDate}, ${setTime}\n${whiteSpace}Will be fired at: ${targetDate}, ${targetTime})*`;
				});

				const embed = new EmbedBuilder({
					title: `You have set ${reminderListTexts.length} reminder${reminderListTexts.length !== 1 ? "s" : ""}.`,
					description: reminderListTexts.join("\n"),
					color: Colors.Gold
				});

				const selectMenu = new ActionRowBuilder<SelectMenuBuilder>()
					.addComponents(
						new SelectMenuBuilder()
							.setCustomId("menu-select-reminder")
							.setPlaceholder("Select one from the list to DELETE a reminder...")
							.setOptions(reminders.map((reminder, i) => ({
								label: reminder.description.substring(0, 25),
								value: `menu-reminder-${i}`
							})))
					)

				response = { embeds: [embed], components: reminderListTexts.length > 0 ? [selectMenu] : undefined }
				break;
		}

		await interaction.editReply(response);
	}
}
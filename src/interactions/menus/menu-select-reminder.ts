import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } from "discord.js";
import { getUserReminders } from "../../utils/timer";

export default <MenuAction>{
	id: "menu-select-reminder",
	exec: async interaction => {
		const reminders = getUserReminders(interaction.user.id);
		const selectedValue = interaction.values[0].match(/\d+/) as RegExpMatchArray;
		const selectedReminder = reminders[parseInt(selectedValue[0])] || undefined;
		if (!selectedReminder) {
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply("This reminder does not exist.");
			return;
		}

		const embed = new EmbedBuilder()
			.setDescription(`**Are you sure you want to delete this reminder?**\n*${selectedReminder.description}*`)
			.setColor(Colors.Gold)
			.setFooter({ text: `Will be fired at` })
			.setTimestamp(selectedReminder.targetTime)

		const buttons = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`btn-reminder-delete-${selectedValue}`)
					.setLabel("Yes")
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId(`btn-reminder-cancel`)
					.setLabel("No")
					.setStyle(ButtonStyle.Danger),
				/* new ButtonBuilder()
					.setCustomId("btn-reminder-update")
					.setLabel("Update")
					.setStyle(ButtonStyle.Secondary) */
			)

		await interaction.reply({ content: `${interaction.user}`, embeds: [embed], components: [buttons] });
	}
}
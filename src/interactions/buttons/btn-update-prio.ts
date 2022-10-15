import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder } from "@discordjs/builders"
import { TextInputBuilder, TextInputStyle } from "discord.js"

export default <ButtonAction>{
	id: "btn-update-prio",
	exec: async interaction => {
		const modal = new ModalBuilder()
			.setCustomId("modal-update-prio")
			.setTitle("Add to prioritized streams")

		const addPrioInput = new TextInputBuilder()
			.setCustomId("input-add-prio")
			.setLabel("Streams to add to the prioritized list")
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false);

		const removePrioInput = new TextInputBuilder()
			.setCustomId("input-remove-prio")
			.setLabel("Streams to remove from the prioritized list")
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false);

		const addPrioActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(addPrioInput);
		const removePrioActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(removePrioInput);

		modal.addComponents(addPrioActionRow, removePrioActionRow);

		await interaction.showModal(modal);
	}
}
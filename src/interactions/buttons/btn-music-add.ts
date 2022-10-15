import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default <ButtonAction>{
	id: "btn-music-add",
	exec: async interaction => {
		const modal = new ModalBuilder()
			.setCustomId("modal-add-song")
			.setTitle("Queue Songs")

		const addSongInput = new TextInputBuilder()
			.setCustomId("input-add-song")
			.setLabel("Enter the songs you want to add to the queue.")
			.setPlaceholder("Seperate multiple entries with new lines...")
			.setStyle(TextInputStyle.Paragraph)

		const addSongActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(addSongInput);

		modal.addComponents(addSongActionRow);

		await interaction.showModal(modal);
	}
}
import { addToQueue } from "../../utils/music";

export default <ModalAction>{
	id: "modal-add-song",
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });

		if (interaction.guild) {
			const inputAdd = interaction.fields.getTextInputValue("input-add-song");
			const songAmount = inputAdd.split("\n");
			await addToQueue(interaction.guild.id, inputAdd, interaction.user.id);

			await interaction.editReply({ content: `*Adding ${songAmount.length} songs to the queue.*` });
		} else {
			await interaction.editReply({ content: `There was an error while adding songs to the queue.` });
		}
	}
}
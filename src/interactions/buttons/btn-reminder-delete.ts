import { splitInteractionID } from "../../utils/commands";
import { clearLocalTimer, getUserReminders } from "../../utils/timer";

export default <ButtonAction>{
	id: "btn-reminder-delete",
	exec: async interaction => {
		if (interaction.message.content !== interaction.user.toString()) {
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply("You can not update this interaction.");
			return;
		}

		if (interaction.message.deletable)
			await interaction.message.delete();

		const ids = splitInteractionID(interaction.customId);
		const userReminders = getUserReminders(interaction.user.id);
		const reminder = userReminders[parseInt(ids[3])];

		clearLocalTimer(reminder);

		await interaction.deferReply();
		await interaction.deleteReply();
	}
}
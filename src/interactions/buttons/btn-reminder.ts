import { splitInteractionID } from "../../utils/commands";
import { clearLocalTimer, getUserReminders } from "../../utils/timer";

type ButtonType = "cancel" | "delete";

export default <ButtonAction>{
	id: "btn-reminder",
	exec: async interaction => {
		if (interaction.message.content !== interaction.user.toString()) {
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply("You can not update this reminder.");
			return;
		}

		const ids = splitInteractionID(interaction.customId);
		const buttonType = ids[2] as ButtonType;

		if (interaction.message.deletable)
			await interaction.message.delete();

		if (buttonType === "delete") {
			const userReminders = getUserReminders(interaction.user.id);
			const reminder = userReminders[parseInt(ids[3])];
			clearLocalTimer(reminder);
		}

		await interaction.deferReply();
		await interaction.deleteReply();
	}
}
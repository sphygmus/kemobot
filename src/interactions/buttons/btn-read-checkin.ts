import { getFatherDMChannel } from "../../utils/messages";

export default <ButtonAction>{
	id: "btn-read-checkin",
	exec: async interaction => {
		const dmChannel = await getFatherDMChannel();
		const message = await dmChannel.messages.fetch(interaction.message.id);
		if (message)
			message.delete();
	}
}
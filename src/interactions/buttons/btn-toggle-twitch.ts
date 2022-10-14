import { toggleTwitchBot } from "../../twitch";
import { updateLiquidInterface } from "../../utils/liquidplus"

export default <ButtonAction>{
	id: "btn-toggle-twitch",
	exec: async interaction => {
		await interaction.reply("*Toggling Twitch bot functionality...*");
		await toggleTwitchBot();
		await updateLiquidInterface();
		await interaction.deleteReply();
	}
}
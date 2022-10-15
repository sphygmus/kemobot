import { toggleLoop } from "../../utils/music";

export default <ButtonAction>{
	id: "btn-music-loop",
	exec: async interaction => {
		await interaction.reply("*Updating playback loop...*");

		if (interaction.guildId)
			await toggleLoop(interaction.guildId);

		await interaction.deleteReply();
	}
}
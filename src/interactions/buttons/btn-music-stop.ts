import { skipSong } from "../../utils/music";

export default <ButtonAction>{
	id: "btn-music-stop",
	exec: async interaction => {
		await interaction.reply(`*${interaction.member} has stopped the playback.*`);

		if (interaction.guildId)
			await skipSong(interaction.guildId, true);

		setTimeout(async () => {
			await interaction.deleteReply();
		}, 3000);
	}
}
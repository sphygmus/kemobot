import { toggleSong } from "../../utils/music";

export default <ButtonAction>{
	id: "btn-music-toggle",
	exec: async interaction => {
		await interaction.reply(`*${interaction.member} has toggled the playback.*`);

		if (interaction.guildId)
			toggleSong(interaction.guildId);

		setTimeout(async () => {
			await interaction.deleteReply();
		}, 3000);
	}
}
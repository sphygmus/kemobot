import { skipSong } from "../../utils/music";

export default <ButtonAction>{
	id: "btn-music-skip",
	exec: async interaction => {
		await interaction.reply(`*${interaction.member} has skipped the song.*`);

		if (interaction.guildId)
			await skipSong(interaction.guildId);

		setTimeout(async () => {
			await interaction.deleteReply();
		}, 3000);
	}
}
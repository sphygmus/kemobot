import { getGuildMusicData } from "../../utils/music";

export default <ButtonAction>{
	id: "btn-music-queue",
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });

		if (interaction.guildId) {
			const guildData = getGuildMusicData(interaction.guildId);
			let i = 0;
			const songs = guildData.queue.slice(0, 5).map(song => {
				i++;
				return `${i}. ${song.title}`;
			});
			await interaction.editReply("**Next 5 songs in the queue:**```" + songs.join("\n") + "```")
		} else {
			await interaction.editReply("There was an error while loading the queue.");
		}
	}
}
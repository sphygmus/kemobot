import { checkUsersInVoice, getGuildMusicData, getUser } from "../../utils/music";

export default <ButtonAction>{
	id: "btn-music-queue",
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });

		if (!interaction.guildId || !interaction.guild) {
			await interaction.editReply("You need to be in a server to use this command.");
			return;
		}

		const userInChannel = await checkUsersInVoice(interaction.guildId, interaction.user.id);
		const guildData = getGuildMusicData(interaction.guildId);
		const botInChannel = guildData.playingIn !== undefined;
		const memberData = await interaction.guild.members.fetch(interaction.user.id);

		let response = "You need to be in a voice channel to use this command.";
		let errorCheck = false;

		if (botInChannel) {
			if (!userInChannel) {
				response = "You need to be in the bot's voice channel to use this command.";
				errorCheck = true;
			}
		} else {
			if (!memberData.voice.channel)
				errorCheck = true;
		}

		if (errorCheck) {
			await interaction.editReply(response);
			return;
		}

		const songs = await Promise.all(guildData.queue.slice(0, 5).map(async (song, i, self) => {
			const user = await getUser(song.requestedBy);
			return `${i + 1}. ${song.title}\n\t(Requested by: ${user.username})${i + 1 !== self.length ? "\n" : ""}`;
		}));

		await interaction.editReply("**Next 5 songs in the queue:**```" + songs.join("\n") + "```")
	}
}
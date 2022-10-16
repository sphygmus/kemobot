import { checkUsersInVoice, getGuildMusicData, skipSong } from "../../utils/music";

export default <ButtonAction>{
	id: "btn-music-stop",
	exec: async interaction => {
		if (!interaction.guildId || !interaction.guild) {
			await interaction.deferReply({ ephemeral: true });
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
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply(response);
			return;
		}

		await interaction.deferReply();
		await interaction.deleteReply();

		await skipSong(interaction.guildId, true);
	}
}
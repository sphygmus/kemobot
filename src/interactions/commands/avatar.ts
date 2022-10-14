import { Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";

const config = new SlashCommandBuilder()
	.setName("avatar")
	.setDescription("Get a user's avatar image.")
	.addUserOption(user => user
		.setName("user")
		.setDescription("Specify a user to get their avatar image.")
	)

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });

		const user = interaction.options.getUser("user") || interaction.user;
		const avatarURL = user.displayAvatarURL({ extension: "png", size: 2048 });
		const embed = new EmbedBuilder()
			.setColor(Colors.Gold)
			.setImage(avatarURL);

		await interaction.editReply({ embeds: [embed] });
	}
}
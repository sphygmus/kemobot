import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getGuilds, updateGuildData } from "../../utils/guilds";

const config = new SlashCommandBuilder()
	.setName("set")
	.setDescription("Change the settings of the server.")
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.addSubcommand(subcommand => subcommand
		.setName("welcome")
		.setDescription("Choose a channel for the bot to greet new users.")
		.addChannelOption(channel => channel
			.setName("channel")
			.setDescription("Choose a channel for the bot to greet new users.")
		))
	.addSubcommand(subcommand => subcommand
		.setName("bot")
		.setDescription("Choose which channel the bot can work in.")
		.addChannelOption(channel => channel
			.setName("channel")
			.setDescription("Choose which channel the bot can work in.")
		))
	.addSubcommand(subcommand => subcommand
		.setName("role")
		.setDescription("Select a role for the new users to receive.")
		.addRoleOption(role => role
			.setName("role")
			.setDescription("Select a role for the new users to receive.")
		))
	.addSubcommand(subcommand => subcommand
		.setName("log")
		.setDescription("Choose which channel the bot should send server logs to.")
		.addChannelOption(channel => channel
			.setName("channel")
			.setDescription("Choose which channel the bot should send server logs to.")
		))
	.addSubcommand(subcommand => subcommand
		.setName("show")
		.setDescription("Show the current server settings."))

const createDefaultGuildData = (guildID: string) => {
	return <GuildData>{
		guildID,
		channels: {}
	}
}

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });

		if (!interaction.guild || !interaction.guildId) {
			await interaction.editReply({ content: "You have to be in a server to use this. " });
			return;
		}

		const guildData = getGuilds().find(guild => guild.guildID === interaction.guildId) || createDefaultGuildData(interaction.guildId);
		const channel = interaction.options.getChannel("channel");
		const role = interaction.options.getRole("role");

		let response: string = "There was an error updating server settings.";

		switch (interaction.options.getSubcommand()) {
			case "welcome":
				guildData.channels.welcome = channel?.id;
				response = channel ? `The welcome channel has been changed to: ${channel}` : "The welcome channel has been reset.";
				break;
			case "bot":
				guildData.channels.bot = channel?.id;
				response = channel ? `The bot channel has been changed to: ${channel}` : "The bot channel has been reset.";
				break;
			case "log":
				guildData.channels.log = channel?.id;
				response = channel ? `The log channel has been changed to: ${channel}` : "The log channel has been reset.";
				break;
			case "role":
				guildData.defaultRole = role?.id;
				response = channel ? `The default role has been changed to: ${channel}` : "The default role has been reset.";
				break;
			default: // "show"
				const guildChannels = interaction.guild.channels;
				const guildRoles = interaction.guild.roles;

				const welcomeChannel = guildData.channels.welcome ? await guildChannels.fetch(guildData.channels.welcome) : null;
				const botChannel = guildData.channels.bot ? await guildChannels.fetch(guildData.channels.bot) : null;
				const logChannel = guildData.channels.log ? await guildChannels.fetch(guildData.channels.log) : null;
				const defaultRole = guildData.defaultRole ? await guildRoles.fetch(guildData.defaultRole) : null;

				const undefinedText = "(undefined)";
				const welcomeText = welcomeChannel ? `#${welcomeChannel.name}` : undefinedText;
				const botText = botChannel ? `#${botChannel.name}` : undefinedText;
				const logText = logChannel ? `#${logChannel.name}` : undefinedText;
				const roleText = defaultRole ? defaultRole.name : undefinedText;

				response = "```" + `Welcome channel: ${welcomeText}\nBot channel: ${botText}\nLog channel: ${logText}\nDefault role: ${roleText}` + "```";
		}

		if (interaction.options.getSubcommand() !== "show")
			updateGuildData(interaction.guildId, guildData);

		await interaction.editReply({ content: response });
	}
}
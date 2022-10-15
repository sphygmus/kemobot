import "dotenv/config";
import fs from "fs";
import path from "path";

import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import { loadInteractions, refreshSlashCommands } from "./utils/commands";
import { loadMessageActions, sendGuildMessage } from "./utils/messages";
import { updateGuildVoiceData } from "./utils/voicelog";
import { getGuilds } from "./utils/guilds";

import Twitch from "./twitch";

let messages: MessageAction[];
let commands: DiscordCommand[];
let buttons: ButtonAction[];
let modals: ModalAction[];

let members: MemberRank[];
let safeMessageIDs: string[];

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	]
});

client.on("reload", () => {
	const member_temp = fs.readFileSync(path.resolve(__dirname, "./data/members.json"), "utf-8");
	members = JSON.parse(member_temp) as MemberRank[];
});

client.once("ready", async (self) => {
	console.log(`> [Discord] The bot (${self.user.tag}) is online.`);
	self.user.setActivity(`Kemobot v${process.env.BOT_VERSION}`, { type: ActivityType.Streaming, url: "https://www.twitch.tv/sphygmus" });

	client.emit("reload");
	messages = await loadMessageActions();

	const [cmd_temp, btn_temp, mdl_temp] = await loadInteractions();

	commands = cmd_temp;
	buttons = btn_temp;
	modals = mdl_temp;

	await Twitch.connect();
});

client.on("interactionCreate", async interaction => {
	if (interaction.isChatInputCommand()) {
		const command = commands.find(cmd => cmd.config.name === interaction.commandName);
		if (command?.minimumRank) {
			const userRank = members.find(list => list.userID === interaction.user.id);
			if (!userRank || userRank.rank < command.minimumRank) {
				await interaction.deferReply({ ephemeral: true });
				await interaction.editReply({ content: "You do not have permissions to use this command." });
				return;
			}
		}

		command?.exec(interaction);
	} else if (interaction.isButton()) {
		const button = buttons.find(btn => btn.id === interaction.customId);
		button?.exec(interaction);
	} else if (interaction.isModalSubmit()) {
		const modal = modals.find(mdl => mdl.id === interaction.customId);
		modal?.exec(interaction);
	}
});

client.on("messageCreate", async message => {
	if (message.author.bot || message.system)
		return;

	const content = message.content.toLowerCase();
	const filtered = messages.filter(msg => {
		if (message.member && msg.users?.includes(message.member.id))
			return true;

		if (msg.keywords?.single?.includes(content))
			return true;

		const globalMatch = msg.keywords?.global?.filter(global => content.includes(global));
		return globalMatch ? globalMatch.length > 0 : false;
	});

	filtered.forEach(msg => {
		msg.exec(message);
	});
});

client.on("safeDeleteMessage", (messageIDs: string[]) => {
	safeMessageIDs = messageIDs;
})

client.on("messageDelete", async message => {
	if (!message.guildId || message.author?.bot)
		return;

	const guildData = getGuilds(message.guildId)[0];
	if (guildData.channels.log && message.channelId !== guildData.channels.log) {
		if (!safeMessageIDs.includes(message.id))
			sendGuildMessage(client, guildData.channels.log, `A message by ${message.author} in channel ${message.channel} was deleted. The message was:\n\`\`\`${message.content}\`\`\``);
	}
})

client.on("voiceStateUpdate", async (oldState, newState) => {
	const oldChannel = oldState.channel ? oldState.channel.name : "(undefined)";
	const newChannel = newState.channel ? newState.channel.name : "(undefined)";

	if (oldChannel === newChannel)
		return;

	const voiceData: VoiceData = {
		userID: newState.member?.id || "unknown",
		before: oldChannel,
		after: newChannel,
		time: Date.now()
	}

	updateGuildVoiceData(newState.guild.id, voiceData);
});

client.on("guildMemberAdd", async member => {
	const guildData = getGuilds(member.guild.id)[0];
	if (guildData) {
		if (guildData.channels.welcome)
			sendGuildMessage(client, guildData.channels.welcome, `Welcome to **${member.guild.name}**, ${member}!`);

		if (guildData.defaultRole) {
			const role = await member.guild.roles.fetch(guildData.defaultRole);
			if (role)
				await member.roles.add(role);
		}

		if (guildData.channels.log)
			sendGuildMessage(client, guildData.channels.log, `User ${member} has joined the server.`);
	}
});

client.on("guildMemberRemove", async member => {
	const guildData = getGuilds(member.guild.id)[0];
	if (guildData && guildData.channels.log) {
		sendGuildMessage(client, guildData.channels.log, `User ${member} has left the server.`);
	}
})

refreshSlashCommands();
client.login(process.env.BOT_TOKEN);

export default client;
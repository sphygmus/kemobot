import fs from "fs";
import path from "path";

import { Client, Message, MessageCreateOptions, MessagePayload, TextChannel } from "discord.js";
import Discord from "../discord";

const loadMessageActions = async () => {
	const messageFiles = fs.readdirSync(path.join(__dirname, "../interactions/messages")).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

	const messages: MessageAction[] = [];
	for (const file of messageFiles) {
		const data = await import(`../interactions/messages/${file}`);
		const message = data.default as MessageAction;
		messages.push(message);
	}

	return messages;
}

const messageExists = async (message: Message) => {
	try {
		await message.channel.messages.fetch(message.id);
		return true;
	} catch (e) {
		return false;
	}
}

const sendGuildMessage = async (client: Client, channelID: string, message: string) => {
	const channel = await client.channels.fetch(channelID) as TextChannel;
	await channel?.send(message);
}

const getFatherDMChannel = async () => {
	const father = await Discord.users.fetch(process.env.FATHER_ID);
	return father.dmChannel || await father.createDM();
}

const reportToFather = async (message: string | MessagePayload | MessageCreateOptions) => {
	const dmChannel = await getFatherDMChannel();
	await dmChannel.send(message);
}

export { getFatherDMChannel, loadMessageActions, messageExists, reportToFather, sendGuildMessage }
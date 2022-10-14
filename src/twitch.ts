import tmi from "tmi.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { checkAndUpdateStreams, getExistingData, saveLiquidPlusData, updateLiquidInterface } from "./utils/liquidplus";
import { reportToFather } from "./utils/messages";

let refreshTimer: NodeJS.Timer;
let liquidPlusData: LiquidPlusData;

const client = new tmi.client({
	identity: {
		username: process.env.TWITCH_USER,
		password: process.env.TWITCH_PASS
	}
});

client.on("connected", async (address, port) => {
	console.log(`> [Twitch] Connected to Twitch at ${address}:${port}`);

	liquidPlusData = getExistingData();
	console.log("> [Local] Succesfully loaded Liquid+ data.");

	liquidPlusData.streamData.running = true;
	saveLiquidPlusData(liquidPlusData);

	const updateStreams = async () => {
		await checkAndUpdateStreams();
	}

	updateStreams();
	refreshTimer = setInterval(updateStreams, 600000);
});

client.on("disconnected", reason => {
	console.log("> [Twitch] Disconnected from Twitch servers.");
	liquidPlusData.streamData.running = false;
	saveLiquidPlusData(liquidPlusData);
	clearInterval(refreshTimer);
});

client.on("message", async (channel, tags, message) => {
	const match = message.match(/(?<=lqd\.plus\/).{6}/);
	if (match) {
		const checkin = match[0];
		if (liquidPlusData.checkins.includes(checkin))
			return;

		const button = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder({
					style: ButtonStyle.Link,
					url: `https://lqd.plus/${checkin}`,
					label: "Check-In"
				}),
				new ButtonBuilder({
					custom_id: "btn-read-checkin",
					style: ButtonStyle.Secondary,
					label: "Mark as Read"
				})
			)

		const messageContent = "```" + message + "```";
		reportToFather({ content: `Father, I found a check-in link! It comes from \`${channel}\`, sent by \`${tags.username}\`.\n${messageContent}`, components: [button] });
		liquidPlusData.checkins.push(checkin);
		saveLiquidPlusData(liquidPlusData);
	}
});

const toggleTwitchBot = async () => {
	liquidPlusData.streamData.running = !liquidPlusData.streamData.running;
	saveLiquidPlusData(liquidPlusData);
	await client[liquidPlusData.streamData.running ? "connect" : "disconnect"]();
	await updateLiquidInterface();
}

export default client;
export { liquidPlusData, toggleTwitchBot }
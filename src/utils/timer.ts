import { TextChannel } from "discord.js";
import fs from "fs";
import path from "path";
import Discord from "../discord";

const REMINDERS_PATH = path.resolve(__dirname, "../data/reminders.json");

const setTimer = async (data: Timer) => {
	const currentTime = Date.now();
	return await Promise.all([
		setTimeout(async () => {
			deleteReminder(data);

			const difference = Date.now() - data.targetTime;
			const days = Math.floor(difference / (1000 * 60 * 60 * 24));

			try {
				const channel = await Discord.channels.fetch(data.channelID) as TextChannel | null;
				const user = await Discord.users.fetch(data.userID);
				if (channel && user)
					channel.send(`${user}\n*You asked to be reminded about something ${days} days ago.*\n**Here is your message:**\n${data.description}`);
			} catch (e) {
				console.log("> [Discord] An error occured while firing the reminder.")
			}
		}, data.targetTime - currentTime)
	]);
}

const getAllReminders = () => {
	const response = fs.readFileSync(REMINDERS_PATH, "utf-8");
	const data = JSON.parse(response) as Timer[];
	return data;
}

const saveReminder = (data: Timer) => {
	const allReminders = getAllReminders();
	allReminders.push(data);
	fs.writeFileSync(REMINDERS_PATH, JSON.stringify(allReminders, null, 4));
}

const deleteReminder = (data: Timer) => {
	const allReminders = getAllReminders();
	const stringifiedData = JSON.stringify(data);
	const reminderIndex = allReminders.findIndex(reminder => JSON.stringify(reminder) === stringifiedData);

	if (reminderIndex < 0)
		return;

	allReminders.splice(reminderIndex, 1);
	fs.writeFileSync(REMINDERS_PATH, JSON.stringify(allReminders, null, 4));
}

export { getAllReminders, deleteReminder, saveReminder, setTimer }
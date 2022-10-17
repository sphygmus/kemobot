import fs from "fs";
import path from "path";
import { TextChannel } from "discord.js";
import Discord from "../discord";

const REMINDERS_PATH = path.resolve(__dirname, "../data/reminders.json");

interface LocalTimer extends Timer {
	timer: NodeJS.Timeout;
	timerID: string;
}

const localTimers: LocalTimer[] = [];

const setTimer = async (data: Timer) => {
	const currentTime = Date.now();
	const timeOut = await new Promise<NodeJS.Timeout>((res) => {
		const timer = setTimeout(async () => {
			deleteReminder(data);

			const difference = Date.now() - data.targetTime;
			const days = Math.floor(difference / (1000 * 60 * 60 * 24));

			try {
				const channel = await Discord.channels.fetch(data.channelID) as TextChannel | null;
				const user = await Discord.users.fetch(data.userID);
				if (channel && user)
					channel.send(`${user}\n*You asked to be reminded about something ${days} days ago.*\n**Here is your message:**\n${data.description}`);
			} catch (e) {
				console.log("> [Discord] An error occured while firing the reminder.");
			}
		}, data.targetTime - currentTime);

		res(timer);
	});

	const localTimer: LocalTimer = {
		...data,
		timer: timeOut,
		timerID: `${data.userID}-${data.startTime}`
	}

	localTimers.push(localTimer);
}

const getAllReminders = () => {
	const response = fs.readFileSync(REMINDERS_PATH, "utf-8");
	const data = JSON.parse(response) as Timer[];
	return data;
}

const getUserReminders = (userID: string) => {
	return getAllReminders().filter(reminder => reminder.userID === userID);
}

const getLocalTimer = (data: Timer) => {
	return localTimers.find(timers => timers.timerID === `${data.userID}-${data.startTime}`);
}

const clearLocalTimer = (data: Timer) => {
	const timerIndex = localTimers.findIndex(timers => timers.timerID === `${data.userID}-${data.startTime}`);
	if (timerIndex < 0)
		return;

	deleteReminder(data);
	localTimers.splice(timerIndex, 1);
}

const saveReminder = (data: Timer) => {
	const allReminders = getAllReminders();
	const stringifiedData = JSON.stringify(data);
	const reminderIndex = allReminders.findIndex(reminder => JSON.stringify(reminder) === stringifiedData);

	if (reminderIndex < 0)
		allReminders.push(data);
	else {
		clearLocalTimer(data);
		allReminders[reminderIndex] = data;
	}

	setTimer(data);
	fs.writeFileSync(REMINDERS_PATH, JSON.stringify(allReminders, null, 4));
}

const deleteReminder = (data: Timer) => {
	const allReminders = getAllReminders();
	const stringifiedData = JSON.stringify(data);
	const reminderIndex = allReminders.findIndex(reminder => JSON.stringify(reminder) === stringifiedData);

	if (reminderIndex < 0)
		return;

	const runningTimeout = getLocalTimer(data);
	if (runningTimeout)
		clearTimeout(runningTimeout.timer);

	allReminders.splice(reminderIndex, 1);
	fs.writeFileSync(REMINDERS_PATH, JSON.stringify(allReminders, null, 4));
}

export { clearLocalTimer, getAllReminders, getLocalTimer, getUserReminders, deleteReminder, saveReminder, setTimer }
import { SlashCommandBuilder } from "discord.js";
import { getDate, getTime } from "../../utils/date";
import { getUserReminders, saveReminder, setTimer } from "../../utils/timer";

const config = new SlashCommandBuilder()
	.setName("remind")
	.setDescription("Set a reminder that will ping you when the time comes.")
	.addStringOption(option => option
		.setName("description")
		.setDescription("Set a short description for your reminder reminder.")
		.setRequired(true)
	)
	.addStringOption(option => option
		.setName("time")
		.setDescription("Set a time for your reminder. Example: 30 minutes.")
		.setRequired(true)
	)

const timeUnits = ["second", "minute", "hour", "day", "week", "month", "year"] as const;
const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

type TimeUnit = typeof timeUnits[number];
type DateUnit = typeof monthNames[number];

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = MONTH * 12;

const timeMultiplier = [SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR];
const timeUnitRegex = (type: TimeUnit) => new RegExp(`(\\d+|next)\\s(${type})(?:s)?`);
const dateUnitRegex = (type: DateUnit) => new RegExp(`(\\d{1,2})\\s(${type})\\s?((?:\\d{2}){1,2})?`);

const CLOCK_REGEX = /(\d{1,2}):(\d{2})/;
const DATE_REGEX = /(\d{1,2})\/(\d{1,2})\/((?:\d{2}){1,2})/;

const decodeTimer = (time: string) => {
	let targetTime = Date.now();

	const clockMatch = time.match(CLOCK_REGEX);
	if (clockMatch) {
		const currentTime = new Date(targetTime);
		const hour = Math.max(0, Math.min(parseInt(clockMatch[1]), 23));
		const minute = Math.max(0, Math.min(parseInt(clockMatch[2]), 59));
		currentTime.setHours(hour, minute, 0, 0);
		targetTime = currentTime.getTime();
	}

	const dateMatch = time.match(DATE_REGEX);
	const tomorrow = time.match("tomorrow");

	if (tomorrow) {
		targetTime += DAY;
	} else if (dateMatch) {
		const currentTime = new Date(targetTime);
		let year = parseInt(dateMatch[3]);
		if (dateMatch[3].length < 3)
			year += 2000;

		const month = Math.max(1, Math.min(12, parseInt(dateMatch[2]))) - 1;
		const daysInMonth = new Date(year, month, 0).getDate();
		const day = Math.max(1, Math.min(daysInMonth, parseInt(dateMatch[1])));

		currentTime.setDate(day);
		currentTime.setMonth(month);
		currentTime.setFullYear(year);
		targetTime = currentTime.getTime();
	} else {
		let dateFound = false;
		for (const month in monthNames) {
			if (!time.includes(monthNames[month]))
				continue;

			const monthMatch = time.match(dateUnitRegex(monthNames[month]));
			if (!monthMatch)
				continue;

			dateFound = true;
			const currentTime = new Date(targetTime);
			let year = monthMatch[3] ? parseInt(monthMatch[3]) : currentTime.getFullYear();
			if (year.toString().length < 3)
				year += 2000;

			const monthIndex = Math.max(0, Math.min(11, parseInt(month)));
			const daysInMonth = new Date(year, monthIndex, 0).getDate();
			const day = Math.max(1, Math.min(daysInMonth, parseInt(monthMatch[1])));

			currentTime.setDate(day);
			currentTime.setMonth(monthIndex);
			currentTime.setFullYear(year);
			targetTime = currentTime.getTime();
			break;
		}

		if (!dateFound) {
			for (const day in dayNames) {
				if (!time.includes(dayNames[day]))
					continue;

				const dayValue = time.match(dayNames[day]);
				if (!dayValue)
					continue;

				const currentTime = new Date(targetTime);
				const dayIndex = dayNames.indexOf(dayValue[0]);
				const daysToAdd = (dayIndex - currentTime.getDay() + 7) % 7;

				currentTime.setDate(currentTime.getDate() + daysToAdd);
				if (currentTime.getTime() <= targetTime)
					currentTime.setDate(currentTime.getDate() + 7);

				targetTime = currentTime.getTime();
				break;
			}
		}
	}


	for (const unit in timeUnits) {
		if (!time.includes(timeUnits[unit]))
			continue;

		const timeValue = time.match(timeUnitRegex(timeUnits[unit]));
		if (!timeValue || timeValue.length < 3)
			continue;

		let multiplier = timeValue[1] === "next" ? 1 : parseInt(timeValue[1]);
		targetTime += multiplier * timeMultiplier[unit]
	}

	return targetTime;
}

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });

		const userReminders = getUserReminders(interaction.user.id);
		if (userReminders.length > 4) {
			await interaction.editReply("You already have maximum amount of reminders set.");
			return;
		}

		const description = interaction.options.getString("description") as string;
		const time = interaction.options.getString("time") as string;
		const targetTime = decodeTimer(time.toLowerCase());

		if (Date.now() >= targetTime) {
			await interaction.editReply("Please enter a valid time for the reminder.");
			return;
		}

		const channelID = interaction.channelId || (await interaction.user.createDM()).id;
		const timerData: Timer = {
			userID: interaction.user.id,
			description,
			startTime: Date.now(),
			targetTime,
			channelID
		}

		saveReminder(timerData);

		const reminderDate = getDate(targetTime);
		const reminderTime = getTime(targetTime);
		await interaction.editReply({ content: `**Your reminder has been set to fire at:** ${reminderDate}, ${reminderTime}.` });
	}
}
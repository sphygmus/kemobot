import { SlashCommandBuilder } from "discord.js";
import { getDate, getTime } from "../../utils/date";
import { getAllReminders, saveReminder, setTimer } from "../../utils/timer";

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

type TimeUnit = typeof timeUnits[number];
type DayName = typeof dayNames[number];

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = MONTH * 12;

const timeMultiplier = [SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR];
const timeUnitRegex = (type: TimeUnit) => new RegExp(`(\\d+|next)\\s(${type})(?:s)?`);
// const dayNameRegex = (day: DayName) => new RegExp(`(next)?\\s?(${day})`);

const CLOCK_REGEX = /(\d{1,2}):(\d{2})/;

const decodeTimer = (time: string) => {
	let targetTime = Date.now();

	const clockMatch = time.match(CLOCK_REGEX);
	if (clockMatch) {
		const currentTime = new Date(targetTime);
		const hour = parseInt(clockMatch[1]);
		const minute = parseInt(clockMatch[2]);
		currentTime.setUTCHours(hour, minute, 0, 0);
		targetTime = currentTime.getTime();
	}

	for (const day in dayNames) {
		if (!time.includes(dayNames[day]))
			continue;

		const dayValue = time.match(dayNames[day]);
		console.log(dayValue);
		if (!dayValue)
			continue;

		const currentTime = new Date(targetTime);
		const dayIndex = dayNames.indexOf(dayValue[0]);
		const daysToAdd = (dayIndex - currentTime.getDay() + 7) % 7;

		currentTime.setDate(currentTime.getDate() + daysToAdd);
		if (currentTime.getTime() <= targetTime)
			currentTime.setDate(currentTime.getDate() + 7);

		targetTime = currentTime.getTime();
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

		const allReminders = getAllReminders();
		const userReminders = allReminders.filter(reminder => reminder.userID === interaction.user.id);
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
		setTimer(timerData);

		const reminderDate = getDate(targetTime);
		const reminderTime = getTime(targetTime);
		await interaction.editReply({ content: `**Your reminder has been set to fire at:** ${reminderDate}, ${reminderTime}.` });
	}
}
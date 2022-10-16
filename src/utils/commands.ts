import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";

const rest = new REST({ version: "10" }).setToken(process.env[process.env.DEV ? "DEBUG_TOKEN" : "BOT_TOKEN"]);

const loadConfigs = async () => {
	const commands = fs.readdirSync(path.join(__dirname, "../interactions/commands")).filter(file => !file.includes("_") && (file.endsWith(".ts") || file.endsWith(".js")));
	const configs: SlashCommand[] = [];

	for (const file of commands) {
		const data = await import(`../interactions/commands/${file}`);
		const command = data.default as DiscordCommand;
		configs.push(command.config);
	}

	return configs.map(command => command.toJSON());
}

const loadInteractions = async () => {
	const commandFiles = fs.readdirSync(path.join(__dirname, "../interactions/commands")).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
	const buttonFiles = fs.readdirSync(path.join(__dirname, "../interactions/buttons")).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
	const modalFiles = fs.readdirSync(path.join(__dirname, "../interactions/modals")).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

	const commands: DiscordCommand[] = [], buttons: ButtonAction[] = [], modals: ModalAction[] = [];
	for (const file of commandFiles) {
		const data = await import(`../interactions/commands/${file}`);
		const command = data.default as DiscordCommand;
		commands.push(command);
	}

	for (const file of buttonFiles) {
		const data = await import(`../interactions/buttons/${file}`);
		const action = data.default as ButtonAction;
		buttons.push(action);
	}

	for (const file of modalFiles) {
		const data = await import(`../interactions/modals/${file}`);
		const action = data.default as ModalAction;
		modals.push(action);
	}

	return [commands, buttons, modals] as [DiscordCommand[], ButtonAction[], ModalAction[]];
}

const refreshSlashCommands = async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		const commands = await loadConfigs();
		if (process.env.DEV)
			await rest.put(Routes.applicationGuildCommands(process.env.DEBUG_CLIENT_ID, process.env.DEBUG_GUILD_ID), { body: commands });
		else
			await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
}

export { loadConfigs, loadInteractions, refreshSlashCommands }
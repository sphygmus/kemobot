import "dotenv/config";
import { REST, Routes } from "discord.js";

const dev = true;

const token = process.env[dev ? "DEBUG_TOKEN" : "BOT_TOKEN"];
const id = process.env[dev ? "DEBUG_CLIENT_ID" : "CLIENT_ID"];
const bot = dev ? "Kemodebug" : "Kemobot";

const rest = new REST({ version: "10" }).setToken(token);
rest.put(Routes.applicationGuildCommands(id, process.env.DEBUG_GUILD_ID), { body: [] })
	.then(_ => console.log(`Deleted all guild commands from ${bot}.`));

rest.put(Routes.applicationCommands(id), { body: [] })
	.then(_ => console.log(`Deleted all global commands from ${bot}.`));
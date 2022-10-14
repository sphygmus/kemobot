import fs from "fs";
import path from "path";

const getGuilds = (guildID?: string) => {
	const response = fs.readFileSync(path.resolve(__dirname, "../data/guilds.json"), "utf-8");
	const data = JSON.parse(response) as GuildData[];

	if (guildID)
		return data.filter(guilds => guilds.guildID === guildID);

	return data;
}

const updateGuildData = (guildID: string, data: GuildData) => {
	const guildData = getGuilds();
	const guildIndex = guildData.findIndex(guild => guild.guildID === guildID);
	if (guildIndex >= 0) {
		guildData[guildIndex] = data;
	} else {
		guildData.push(data);
	}

	fs.writeFileSync(path.resolve(__dirname, "../data/guilds.json"), JSON.stringify(guildData, null, 4));
}

export { getGuilds, updateGuildData }
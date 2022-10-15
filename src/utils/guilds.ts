import fs from "fs";
import path from "path";

const defaultData: GuildData = {
	guildID: "0",
	channels: {},
	music: {}
}

const getGuilds = (guildID?: string) => {
	const response = fs.readFileSync(path.resolve(__dirname, "../data/guilds.json"), "utf-8");
	const data = JSON.parse(response) as GuildData[];

	if (guildID) {
		const guildData = data.filter(guilds => guilds.guildID === guildID);
		if (!guildData[0])
			return [{ ...defaultData, guildID }];

		return guildData;
	}

	return data;
}

const updateGuildData = (guildID: string, data: GuildData) => {
	const guildData = getGuilds();
	const guildIndex = guildData.findIndex(guild => guild.guildID === guildID);

	if (guildIndex >= 0)
		guildData[guildIndex] = data;
	else
		guildData.push(data);

	fs.writeFileSync(path.resolve(__dirname, "../data/guilds.json"), JSON.stringify(guildData, null, 4));
}

export { getGuilds, updateGuildData }
import fs from "fs";
import path from "path";

type GuildVoiceLogs = {
	guildID: string;
	logs: VoiceData[];
}

const getGuildVoiceData = () => {
	const response = fs.readFileSync(path.resolve(__dirname, "../data/voicelog.json"), "utf-8");
	const data = JSON.parse(response) as GuildVoiceLogs[];
	return data;
}

const updateGuildVoiceData = (guildID: string, voiceData: VoiceData) => {
	const voiceLogs = getGuildVoiceData();
	const guildIndex = voiceLogs.findIndex(logs => logs.guildID === guildID);
	if (guildIndex >= 0) {
		voiceLogs[guildIndex].logs.push(voiceData);
	} else {
		voiceLogs.push({
			guildID,
			logs: [voiceData]
		})
	}

	fs.writeFileSync(path.resolve(__dirname, "../data/voicelog.json"), JSON.stringify(voiceLogs, null, 4));
}

export { getGuildVoiceData, updateGuildVoiceData }
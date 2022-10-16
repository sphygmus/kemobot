declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_VERSION: string;
			DEV?: string;
			BOT_TOKEN: string;
			CLIENT_ID: string;
			FATHER_ID: string;
			DEBUG_TOKEN: string;
			DEBUG_CLIENT_ID: string;
			DEBUG_GUILD_ID: string;
			TWITCH_USER: string;
			TWITCH_PASS: string;
		}
	}

	interface Timer {
		userID: string;
		description: string;
		startTime: number;
		targetTime: number;
		channelID: string;
	}
}

export { }
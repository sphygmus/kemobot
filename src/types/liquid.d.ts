declare global {
	interface LiquidPlusData {
		prioritized: string[];
		checkins: string[];
		interface?: string;
		streamData: {
			running: boolean;
			lastUpdate: number;
			streams: string[];
		}
	}

	interface MatchData {
		started: boolean;
		channel_name: string;
	}

	interface StreamData {
		name: string;
		id: string;
		game_name: string;
		avatar: string;
	}

	interface Prioritized {
		high: string[];
		regular: string[];
		low: string[];
	}
}

export { }
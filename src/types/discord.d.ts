import {
	ButtonInteraction,
	CacheType,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

import { AudioPlayer } from "@discordjs/voice";
import { LoopType } from "../utils/music";

declare global {
	type SlashCommand = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandsOnlyBuilder

	interface DiscordCommand {
		config: SlashCommand;
		minimumRank?: number;
		exec: (interaction: ChatInputCommandInteraction) => void;
	}

	interface ButtonAction {
		id: string;
		exec: (interaction: ButtonInteraction) => void;
	}

	interface MenuAction {
		id: string;
		exec: (interaction: SelectMenuInteraction) => void;
	}

	interface MessageAction {
		users?: string[];
		keywords?: {
			single?: string[];
			global?: string[];
		},
		exec: (message: Message<boolean>) => void;
	}

	interface ModalAction {
		id: string;
		exec: (interaction: ModalSubmitInteraction) => void;
	}

	type MemberRank = {
		userID: string;
		rank: number;
	}

	type VoiceData = {
		userID: string;
		before: string;
		after: string;
		time: number;
	}

	interface GuildData {
		guildID: string;
		defaultRole?: string;
		channels: {
			welcome?: string;
			bot?: string;
			log?: string;
		};
		music: {
			channelID?: string;
			messageID?: string;
		}
	}

	type SongData = {
		url: string;
		title: string;
		duration: string;
		thumbnail: string;
		requestedBy: string;
		requestTime: number;
	}

	interface GuildMusicData {
		guildID: string;
		looping: LoopType;
		player?: AudioPlayer;
		playingIn?: string;
		queue: SongData[];
	}


}

export { }
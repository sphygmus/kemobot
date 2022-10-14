import {
	ButtonInteraction,
	CacheType,
	ChatInputCommandInteraction,
	Message,
	ModalSubmitInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

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

	type GuildData = {
		guildID: string;
		defaultRole?: string;
		channels: {
			welcome?: string;
			bot?: string;
			log?: string;
		}
	}
}

export { }
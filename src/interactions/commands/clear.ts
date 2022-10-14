import { Collection, Message, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

const config = new SlashCommandBuilder()
	.setName("clear")
	.setDescription("Delete messages in a channel. Default amount is 50.")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.addIntegerOption(integer => integer
		.setName("amount")
		.setDescription("Amount of messages to delete.")
	)

export default <DiscordCommand>{
	config,
	exec: async interaction => {
		await interaction.deferReply({ ephemeral: true });

		const channel = interaction.guildId ? interaction.channel : (interaction.user.dmChannel || await interaction.user.createDM());
		if (!channel) {
			await interaction.editReply({ content: `There was an error fetching the channel.` });
			return;
		}

		// There seems to be a bug while filtering messages.
		// https://github.com/discordjs/discord.js/issues/8545
		let messages = await channel.messages.fetch() as Collection<string, Message<true>>;

		if (interaction.guildId === null)
			messages = messages.filter(message => message.author.id === interaction.client.user.id);

		const amount = interaction.options.getInteger("amount");
		const defaultAmount = Math.max(messages.size, 50);
		const minimumToDelete = Math.min(messages.size, defaultAmount);
		const deleteAmount = amount ? Math.min(amount, minimumToDelete) : minimumToDelete;

		let i = 0;
		const safeMessages: Message[] = [];
		messages.forEach(message => {
			if (i === deleteAmount)
				return;

			safeMessages.push(message);
			i++;
		});

		interaction.client.emit("safeDeleteMessage", safeMessages.map(msg => msg.id));

		safeMessages.forEach(async message => {
			await message.delete();
		})

		await interaction.editReply({ content: `Deleting ${deleteAmount} messages.` });
	}
}
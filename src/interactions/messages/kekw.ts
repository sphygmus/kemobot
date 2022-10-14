const KEKW_EMOTE = "<:KEKW:656904344582750228>";

export default <MessageAction>{
	keywords: {
		global: ["kekw"]
	},
	exec: async message => {
		const reply = Math.floor(Math.random() * 2) === 0;
		if (reply)
			await message.reply(KEKW_EMOTE);
		else
			await message.react(KEKW_EMOTE);
	}
}
import path from "path";
import { messageExists } from "../../utils/messages";

const phrases = [
	"didn't ask",
	"didn't ask + ratio",
	"sorduğumu hatırlamıyorum",
	"sormadım",
	"boş yapma ibrahim",
	"çok konuşma",
	"kesin öyledir",
	"bunu diyerek gay olduğunu kanıtladın",
	"yok öyle bir şey",
	"bence yalan söylüyorsun",
	"sen de bi susmadın",
	"yalancı bu herif inanmayın"
];

const images = [
	path.join(__dirname, "../../assets/message_assets/didntask.png"),
	path.join(__dirname, "../../assets/message_assets/didntask2.png"),
	path.join(__dirname, "../../assets/message_assets/no-askers.png")
];

const reactions = ["🇩", "🇮", "<:d_alt:959897469842501652>", "🇳", "🇹", "🇦", "🇸", "🇰"];

export default <MessageAction>{
	users: ["612713932574031879"],
	exec: async message => {
		const chanceToReply = Math.floor(Math.random() * 5);
		if (chanceToReply === 0) {
			const replyTypeNum = Math.floor(Math.random() * 10);
			if (replyTypeNum < 5) {
				const randomPhrase = Math.floor(Math.random() * phrases.length);
				await message.reply(phrases[randomPhrase]);
			} else if (replyTypeNum < 9) {
				await message.reply({ files: [images[Math.floor(Math.random() * 2)]] });
			} else {
				reactions.forEach(async reaction => {
					const exists = await messageExists(message);
					if (exists)
						await message.react(reaction);
				});
			}
		}
	}
}
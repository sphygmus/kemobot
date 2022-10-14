import path from "path";

const MARION_PATH = path.join(__dirname, "../../assets/message_assets/marion.jpeg");

export default <MessageAction>{
	keywords: {
		single: ["no", "no."],
		global: ["marion", "areavansel", "kekavansel"]
	},
	exec: async message => {
		await message.reply({ files: [MARION_PATH] });
	}
}
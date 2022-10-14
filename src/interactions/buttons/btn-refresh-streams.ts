import { checkAndUpdateStreams, getExistingData, saveLiquidPlusData, updateLiquidInterface } from "../../utils/liquidplus";

export default <ButtonAction>{
	id: "btn-refresh-streams",
	exec: async interaction => {
		await interaction.reply("*Refreshing Liquid+ streams...*");

		let liquidData = getExistingData();
		liquidData.streamData.streams = [];
		saveLiquidPlusData(liquidData);

		await checkAndUpdateStreams();
		await updateLiquidInterface();

		await interaction.deleteReply();
	}
}
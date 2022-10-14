import { getExistingData, saveLiquidPlusData, updateLiquidInterface } from "../../utils/liquidplus";

export default <ModalAction>{
	id: "modal-update-prio",
	exec: async interaction => {
		await interaction.reply("*Updating prioritized streams...*");
		let liquidData = getExistingData();

		const inputAdd = interaction.fields.getTextInputValue("input-add-prio");
		const prioToAdd = inputAdd.toLowerCase().replace(/,/g, " ").split(" ").filter(streams => streams.length > 0);
		prioToAdd.forEach(stream => {
			if (!liquidData.prioritized.includes(stream))
				liquidData.prioritized.push(stream);
		});

		const inputRemove = interaction.fields.getTextInputValue("input-remove-prio");
		const prioToRemove = inputRemove.toLowerCase().replace(/,/g, " ").split(" ").filter(streams => streams.length > 0);
		prioToRemove.forEach(stream => {
			const streamIndex = liquidData.prioritized.indexOf(stream);
			if (streamIndex >= 0)
				liquidData.prioritized.splice(streamIndex, 1);
		});

		await interaction.deleteReply();
		saveLiquidPlusData(liquidData);
		await updateLiquidInterface();
	}
}
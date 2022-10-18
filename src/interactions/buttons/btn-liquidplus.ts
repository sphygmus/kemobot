import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

import { toggleTwitchBot } from "../../twitch";
import { checkAndUpdateStreams, getExistingData, saveLiquidPlusData, updateLiquidInterface } from "../../utils/liquidplus";
import { splitInteractionID } from "../../utils/commands";
import { getFatherDMChannel } from "../../utils/messages";

type ButtonType = "checkin" | "prio" | "refresh" | "toggle";

export default <ButtonAction>{
	id: "btn-liquidplus",
	exec: async interaction => {
		const ids = splitInteractionID(interaction.customId);
		const buttonType = ids[2] as ButtonType;
		switch (buttonType) {
			case "checkin":
				const dmChannel = await getFatherDMChannel();
				const message = await dmChannel.messages.fetch(interaction.message.id);
				if (message)
					message.delete();

				return;
			case "prio":
				const modal = new ModalBuilder()
					.setCustomId("modal-update-prio")
					.setTitle("Add to prioritized streams")

				const addPrioInput = new TextInputBuilder()
					.setCustomId("input-add-prio")
					.setLabel("Streams to add to the prioritized list")
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(false);

				const removePrioInput = new TextInputBuilder()
					.setCustomId("input-remove-prio")
					.setLabel("Streams to remove from the prioritized list")
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(false);

				const addPrioActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(addPrioInput);
				const removePrioActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(removePrioInput);
				modal.addComponents(addPrioActionRow, removePrioActionRow);

				await interaction.showModal(modal);
				return;
			case "refresh":
				let liquidData = getExistingData();
				liquidData.streamData.streams = [];
				saveLiquidPlusData(liquidData);

				await checkAndUpdateStreams();
				await updateLiquidInterface();
				break;
			case "toggle":
				await toggleTwitchBot();
				await updateLiquidInterface();
				break;
		}

		await interaction.deferReply();
		await interaction.deleteReply();
	}
}
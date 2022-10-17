export default <ButtonAction>{
	id: "btn-reminder-cancel",
	exec: async interaction => {
		if (interaction.message.content !== interaction.user.toString()) {
			await interaction.deferReply({ ephemeral: true });
			await interaction.editReply("You can not update this interaction.");
			return;
		}

		if (interaction.message.deletable)
			await interaction.message.delete();

		await interaction.deferReply();
		await interaction.deleteReply();
	}
}
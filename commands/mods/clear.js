// Imports
const { SlashCommandBuilder } = require("discord.js");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprimer un nombre spécifié de messages")
    .addIntegerOption((option) =>
      option
        .setName("nombre")
        .setDescription("Le nombre de messages à supprimer")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  // Execution
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const amount = interaction.options.getInteger("nombre");
    
    // Delete the messages
    await interaction.channel.bulkDelete(amount, true);
    await interaction.editReply({
      content: `✅ ${amount} messages ont été supprimés`,
      ephemeral: true,
    });
  },
};

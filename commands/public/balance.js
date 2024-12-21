// Imports
const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const dataFile = "./economy.json";

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Affiche votre solde ou celui d'un autre membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre dont vous voulez voir le solde")
        .setRequired(false)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.options.getUser("membre") || interaction.user;
    const userid =
      user.id;
    const data = JSON.parse(fs.readFileSync(dataFile));

    try {
      // Verify if user exists
      if (!data[userid]) {
        data[userid] = { balance: 0 };
      }
      const balance = data[userid].balance;

      // Message
      if (userid === interaction.user.id) {
        await interaction.editReply(
          `💰 Vous avez ${balance} <:money:1272567139760472205>`
        );
      } else {
        await interaction.editReply(
          `💰 ${user} a ${balance} <:money:1272567139760472205>`
        );
      }
    } catch (error) {
      // Error
      console.error("[❌ERROR]", error);
      await interaction.editReply("❌ Impossible de récupérer le solde");
    }
  },
};

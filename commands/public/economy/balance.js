// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const dataFile = "./economy/economy-data.json";

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-balance")
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
    const userid = user.id;
    const userName = user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));
    let message;

    try {
      // Verify if user exists
      if (!data[userid]) {
        data[userid] = { balance: 0 };
      }
      const balance = data[userid].balance;

      // Message
      if (userid === interaction.user.id) {
        message = `Vous avez **${balance}** <:money:1272567139760472205>`;
      } else {
        message = `${user} a **${balance}** <:money:1272567139760472205>`;
      }

      const isPositive = balance >= 0;

      // Embed
      const embed = new EmbedBuilder()
        .setColor(isPositive ? "Green" : "Red")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(message)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Error
      interaction.client.logger.error("Balance", error);
      await interaction.editReply("❌ Impossible de récupérer le solde");
    }
  },
};

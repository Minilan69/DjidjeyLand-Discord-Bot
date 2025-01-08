// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const dataFile = "./economy/economy-data.json";

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-top")
    .setDescription("Affiche le top des membres les plus riches"),

  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.user;
    const userName = user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));

    // Embed
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setAuthor({ name: userName, iconURL: userAvatar })
      .setTimestamp();

    try {
      // Get the TOP 10 of richest people
      let top = [];
      for (const userId in data) {
        const userData = data[userId];
        top.push({ userID: userId, balance: userData.balance });
      }
      top.sort((a, b) => b.balance - a.balance);
      const top10 = top.slice(0, 10);

      // Add each people
      let topDescription = "";
      let iterations = 0;
      for (const { userID, balance } of top10) {
        iterations++;
        topDescription += `${iterations}. <@${userID}> • ${balance} <:money:1272567139760472205>\n`;
        console.log(embed);
      }
      embed.setDescription(
        `Voici le top des gens les plus riches\n **${topDescription}**`
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Error
      interaction.client.logger.error("Balance", error);
      await interaction.editReply("❌ Impossible de récupérer le top");
    }
  },
};

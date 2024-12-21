// Imports
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const dataFile = "./economy.json";
const ms = require("ms");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("collect")
    .setDescription("Réclamez votre revenu quotidien"),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const userId = interaction.user.id;
    const data = JSON.parse(fs.readFileSync(dataFile));

    try {
      // Verify if user exists
      if (!data[userId]) {
        data[userId] = { balance: 0, lastClaim: 0 };
      }

      const lastClaim = data[userId].lastClaim;
      const timePassed = Date.now() - lastClaim;
      const cooldown = ms("23h");

      if (timePassed < cooldown) {
        let remainingTime = ms(cooldown - timePassed, { long: true });
        remainingTime = remainingTime
          .replace("hours", "heures")
          .replace("hour", "heure")
          .replace("minutes", "minutes")
          .replace("minute", "minute");
        return await interaction.editReply(
          `❌ Vous devez attendre encore **${remainingTime}**`
        );
      }

      // Add money
      data[userId].balance += 10;
      data[userId].lastClaim = Date.now();

      fs.writeFileSync(dataFile, JSON.stringify(data));

      await interaction.editReply(
        "💰 Vous avez réclamé votre revenu quotidien de **10 <:money:1272567139760472205>**!"
      );
    } catch (error) {
      console.error("[❌ERROR]", error);
      await interaction.editReply(
        "❌ Impossible de réclamer votre revenu quotidien"
      );
    }
  },
};

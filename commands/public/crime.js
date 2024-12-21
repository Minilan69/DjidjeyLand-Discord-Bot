// Imports
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const dataFile = "./economy.json";
const ms = require("ms");
const messagesFile = "./messages/crime-messages.json";

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("crime")
    .setDescription(
      "Commettez un crime et risquez de perdre ou gagner de l'argent !"
    ),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const userId = interaction.user.id;
    const data = JSON.parse(fs.readFileSync(dataFile));
    const crimeMessages = JSON.parse(fs.readFileSync(messagesFile));
    const balance = data[userId].balance;

    try {
      // Verify if user exists
      if (!data[userId]) {
        data[userId] = { balance: 0, lastCrime: 0 };
      }

      const lastCrime = data[userId].lastCrime;
      const timePassed = Date.now() - lastCrime;
      const cooldown = ms("4h");

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

      // Choose if user wins or loses
      const isWin = Math.random() > 0.5; // 50% 
      
      if (isWin) {
        const amount = Math.floor(Math.random() * 20) + 1;

        data[userId].balance += amount;
        const randomMessage = crimeMessages.winMessages[
          Math.floor(Math.random() * crimeMessages.winMessages.length)
        ].replace("{amountWon}", amount);

        await interaction.editReply(randomMessage);
      } else {
        const percentage = Math.random() * 0.04 + 0.01; // 1% to 5%

        const amount = Math.round(balance * percentage);
        data[userId].balance -= amount;
        const randomMessage = crimeMessages.loseMessages[
          Math.floor(Math.random() * crimeMessages.loseMessages.length)
        ].replace("{amountLost}", amount);

        await interaction.editReply(randomMessage);
      }

      data[userId].lastCrime = Date.now();
      fs.writeFileSync(dataFile, JSON.stringify(data));
    } catch (error) {
      console.error("[❌ERROR]", error);
      await interaction.editReply(
        "❌ Impossible de commettre un crime pour le moment, veuillez réessayer plus tard"
      );
    }
  },
};

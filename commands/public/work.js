// Imports
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const dataFile = "./economy.json";
const ms = require("ms");
const messagesFile = "./messages/work-messages.json";

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Travaillez pour gagner de l'argent"),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const userId = interaction.user.id;
    const data = JSON.parse(fs.readFileSync(dataFile));
    const workMessages = JSON.parse(fs.readFileSync(messagesFile));
    const amount = Math.floor(Math.random() * 10)+1;

    try {
      // Verify if user exists
      if (!data[userId]) {
        data[userId] = { balance: 0, lastWork: 0 };
      }

      const lastWork = data[userId].lastWork;
      const timePassed = Date.now() - lastWork;
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

      // Add money
      data[userId].balance += amount;
      data[userId].lastWork = Date.now();

      fs.writeFileSync(dataFile, JSON.stringify(data));

      const randomMessage = workMessages[
        Math.floor(Math.random() * workMessages.length)
      ].replace("{amount}", amount);

      await interaction.editReply(randomMessage);
    } catch (error) {
      console.error("[❌ERROR]", error);
      await interaction.editReply(
        "❌ Impossible de travailler pour le moment, veuillez réessayer plus tard"
      );
    }
  },
};

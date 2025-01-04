// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const dataFile = "./economy/economy-data.json";
const messagesFile = "./economy/messages/work-messages.json";
const {
  work: { min, max, time }, log
} = require("../../../economy/economy-config.json");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-work")
    .setDescription("Travaillez pour gagner de l'argent"),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const userId = interaction.user.id;
    const userName = interaction.user.username;
    const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));
    const workMessages = JSON.parse(fs.readFileSync(messagesFile));
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;

    try {
      // Verify if user exists
      if (!data[userId]) {
        data[userId] = { balance: 0, lastWork: 0 };
      }

      const lastWork = data[userId].lastWork;
      const timePassed = Date.now() - lastWork;
      const cooldown = ms(time);


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

      const randomMessage = workMessages[
        Math.floor(Math.random() * workMessages.length)
      ].replace("{amount}", amount);

      //  Embed creation
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(randomMessage)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Update Data
      data[userId].balance += amount;
      data[userId].lastWork = Date.now();

      fs.writeFileSync(dataFile, JSON.stringify(data));

      // Log
      const logChannel = interaction.guild.channels.cache.get(log);
      if (logChannel) {
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setAuthor({ name: userName, iconURL: userAvatar })
              .setDescription(
                `Amount : **+${amount}** <:money:1272567139760472205>\n Reason : **Work**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      interaction.client.logger.error("Work", error);
      await interaction.editReply(
        "❌ Impossible de travailler pour le moment, veuillez réessayer plus tard"
      );
    }
  },
};

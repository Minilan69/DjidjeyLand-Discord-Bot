// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const dataFile = "./economy/economy-data.json";
const messagesFile = "./economy/messages/collect-messages.json";
const {
  collect: { money, time }, log
} = require("../../../economy/economy-config.json");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-collect")
    .setDescription("Réclamez votre revenu quotidien"),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const userId = interaction.user.id;
    const userName = interaction.user.username;
    const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));
    const collectMessages = JSON.parse(fs.readFileSync(messagesFile));

    try {
      // Verify if user exists
      if (!data[userId]) {
        data[userId] = { balance: 0, lastClaim: 0 };
      }

      const lastClaim = data[userId].lastClaim;
      const timePassed = Date.now() - lastClaim;
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

      const randomMessage = collectMessages[
        Math.floor(Math.random() * collectMessages.length)
      ].replace("{amount}", money);

      //  Embed creation
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(randomMessage)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Update Data
      data[userId].balance += money;
      data[userId].lastClaim = Date.now();

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
                `Amount : **+${money}** <:money:1272567139760472205>\n Reason : **Collect**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      interaction.client.logger.error("Collect", error);
      await interaction.editReply(
        "❌ Impossible de réclamer votre revenu quotidien"
      );
    }
  },
};

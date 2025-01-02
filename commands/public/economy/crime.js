// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const ms = require("ms");
const dataFile = "./economy/economy-data.json";
const messagesFile = "./economy/messages/crime-messages.json";
const {
  crime: { minWin, maxWin, minLose, maxLose, time }, log
} = require("../../../economy/economy-config.json");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-crime")
    .setDescription(
      "Commettez un crime et risquez de perdre ou gagner de l'argent !"
    ),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const userId = interaction.user.id;
    const userName = interaction.user.username;
    const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));
    const crimeMessages = JSON.parse(fs.readFileSync(messagesFile));
    let randomMessage;
    let amount;

    try {
      // Verify if user exists
      if (!data[userId]) {
        data[userId] = { balance: 0, lastCrime: 0 };
      }

      let balance = data[userId].balance;
      const lastCrime = data[userId].lastCrime;
      const timePassed = Date.now() - lastCrime;
      const cooldown = ms(time);

      // Verify if user have negative balance
      if (balance < 0) {
        balance = 0;
      }

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
        amount = Math.floor(Math.random() * (maxWin - minWin + 1)) + minWin;
        data[userId].balance += amount;

        // Choose Random Message
        randomMessage = crimeMessages.winMessages[
          Math.floor(Math.random() * crimeMessages.winMessages.length)
        ].replace("{amountWon}", amount);
      } else {
        const percentage = (Math.random() * maxLose) / 100 + minLose / 100;
        amount = Math.round(balance * percentage);
        data[userId].balance -= amount;

        // Choose Random Message
        randomMessage = crimeMessages.loseMessages[
          Math.floor(Math.random() * crimeMessages.loseMessages.length)
        ].replace("{amountLost}", amount);
      }

      //  Embed creation
      const embed = new EmbedBuilder()
        .setColor(isWin ? "Green" : "Red")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(randomMessage)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Update data
      data[userId].lastCrime = Date.now();
      fs.writeFileSync(dataFile, JSON.stringify(data));

      // Log
      const logChannel = interaction.guild.channels.cache.get(log);
      if (logChannel && amount != 0) {
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(isWin ? "Green" : "Red")
              .setAuthor({ name: userName, iconURL: userAvatar })
              .setDescription(
                `Amount : **${
                  isWin ? "+" : "-"
                }${amount}** <:money:1272567139760472205>\n Reason : **Crime**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      interaction.client.logger.error("Crime", error);
      await interaction.editReply(
        "❌ Impossible de commettre un crime pour le moment, veuillez réessayer plus tard"
      );
    }
  },
};

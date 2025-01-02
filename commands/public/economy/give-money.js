// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const dataFile = "./economy/economy-data.json";
const {log} = require("../../../economy/economy-config.json");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-give-money")
    .setDescription("Permet de donner de l'argent à quelqu'un")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à qui vous voulez donner de l'argent")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Le montant à donner")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.user;
    const usergive = interaction.options.getUser("membre");
    const amount = interaction.options.getInteger("montant");

    const userId = user.id;
    const userName = user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });
    const usergiveId = usergive.id;
    const usergiveName = usergive.username;
    const usergiveAvatar = usergive.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));

    try {
      // Verify if user2 exists
      if (!data[usergiveId]) {
        data[usergiveId] = { balance: 0 };
      }

      // Verify if user1 have enough money
      if (data[userId].balance < amount) {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setAuthor({ name: userName, iconURL: userAvatar })
          .setDescription(
            `Tu n'as pas assez d'argent pour donner ${amount} <:money:1272567139760472205> à ${usergive}`
          )
          .setTimestamp();
        return await interaction.editReply({ embeds: [embed] });
      }

      //  Embed creation
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(
          `Tu as donné ${amount} <:money:1272567139760472205> à ${usergive}`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Update Data
      data[userId].balance -= amount;
      data[usergiveId].balance += amount;

      fs.writeFileSync(dataFile, JSON.stringify(data));

      // Log
      const logChannel = interaction.guild.channels.cache.get(log);
      if (logChannel && amount != 0) {
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setAuthor({ name: userName, iconURL: userAvatar })
              .setDescription(
                `Amount : **-${amount}** <:money:1272567139760472205>\n Reason : **Give To ${usergive}**`
              )
              .setTimestamp(),
          ],
        });
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setAuthor({ name: usergiveName, iconURL: usergiveAvatar })
              .setDescription(
                `Amount : **+${amount}** <:money:1272567139760472205>\n Reason : **Give By ${user}**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      interaction.client.logger.error("GiveMoney", error);
      await interaction.editReply("❌ Impossible d'ajouter de l'argent");
    }
  },
};

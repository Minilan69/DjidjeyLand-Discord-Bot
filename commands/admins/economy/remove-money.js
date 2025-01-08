// Imports
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const dataFile = "./economy/economy-data.json";
const {log} = require("../../../economy/economy-config.json");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-retirer-argent")
    .setDescription("Retire de l'argent à un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à qui vous voulez retirer de l'argent")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("montant")
        .setDescription("Le montant à retirer")
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.options.getUser("membre");
    const amount = interaction.options.getInteger("montant");

    const userId = user.id;
    const userName = user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));

    try {
      // Verify if user exists
      if (!data[userId]) {
        data[userId] = { balance: 0 };
      }

      //  Embed creation
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(
          `${amount} <:money:1272567139760472205> ont été retiré à ${user}`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Update Data
      data[userId].balance -= amount;

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
                `Amount : **-${amount}** <:money:1272567139760472205>\n Reason : **Remove By ${interaction.user}**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      interaction.client.logger.error("AddMoney", error);
      await interaction.editReply("❌ Impossible de retirer de l'argent");
    }
  },
};

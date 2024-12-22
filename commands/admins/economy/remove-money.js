// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const dataFile = "./economy/economy-data.json";

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-money")
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
    ),
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
      data[userId].lastWork = Date.now();

      fs.writeFileSync(dataFile, JSON.stringify(data));
    } catch (error) {
      console.error("[❌ERROR]", error);
      await interaction.editReply("❌ Impossible de retirer de l'argent");
    }
  },
};

// Imports
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("path");
const dataFile = "./economy/economy-data.json";
const itemsDirectory = "./economy/shop/";

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-inventaire")
    .setDescription("Affiche votre inventaire ou celui d'un autre membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre dont vous voulez voir l'inventaire")
        .setRequired(false)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.options.getUser("membre") || interaction.user;
    const userId = user.id;
    const userName = user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });
    const data = JSON.parse(fs.readFileSync(dataFile));

    // Vérification de l'existence des données de l'utilisateur
    if (!data[userId] || !data[userId].inventory) {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(
          `${
            userId === interaction.user.id
              ? "Votre inventaire"
              : `L'inventaire de ${user}`
          } est vide`
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    const inventory = data[userId].inventory;

    // Créer l'embed
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setAuthor({ name: userName, iconURL: userAvatar })
      .setDescription(
        userId === interaction.user.id
          ? "Voici votre inventaire :"
          : `Voici l'inventaire de ${userName} :`
      )
      .setTimestamp();

    let hasItems = false;

    // Ajouter les items dans l'inventaire
    for (const [itemId, quantity] of Object.entries(inventory)) {
      if (quantity <= 0) continue; // Ignorer les items avec une quantité de 0

      // Trouver le fichier correspondant à l'item
      const itemFiles = fs.readdirSync(itemsDirectory);
      const itemFile = itemFiles.find((file) => {
        const itemData = JSON.parse(
          fs.readFileSync(path.join(itemsDirectory, file))
        );
        return itemData.id === parseInt(itemId, 10); // Comparer les ID
      });

      if (!itemFile) {
        // Si le fichier de l'item n'existe pas, ignorer
        continue;
      }

      const itemData = JSON.parse(
        fs.readFileSync(path.join(itemsDirectory, itemFile))
      );
      embed.addFields({
        name: `${itemData.name}`,
        value: `Quantité : **${quantity}**`,
        inline: true,
      });

      hasItems = true;
    }

    // Vérification si l'inventaire contient des items valides
    if (!hasItems) {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setAuthor({ name: userName, iconURL: userAvatar })
        .setDescription(
          `${
            userId === interaction.user.id
              ? "Votre inventaire"
              : `L'inventaire de ${user}`
          } est vide`
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    // Réponse
    await interaction.editReply({ embeds: [embed] });
  },
};

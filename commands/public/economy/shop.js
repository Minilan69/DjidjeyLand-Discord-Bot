const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-shop")
    .setDescription("Affiche la boutique avec les items disponibles"),

  async execute(interaction) {
    await interaction.deferReply();

    const shopItemsPath = path.join(__dirname, "../../../economy/shop");
    const shopItems = fs
      .readdirSync(shopItemsPath)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(shopItemsPath, file);
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
      });

    // Créer l'embed de la boutique
    const shopEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Boutique")
      .setDescription("Voici les articles disponibles à l'achat :")
      .setFooter({ text: "Utilisez /buy [item] pour acheter un item" })
      .setTimestamp();

    // Ajouter chaque item à l'embed
    shopItems.forEach((item) => {
      shopEmbed.addFields({
        name: item.name,
        value: `${item.description}\nPrix : ${
          item.price
        } <:money:1272567139760472205>\n${
          item.requiredRole ? `Rôle requis : <@&${item.requiredRole}>` : ""
        }`,
        inline: true,
      });
    });

    // Envoyer l'embed à l'utilisateur
    await interaction.editReply({ embeds: [shopEmbed] });
  },
};

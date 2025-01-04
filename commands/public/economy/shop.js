const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-shop")
    .setDescription("Affiche le shop")
    .addStringOption((option) => {
      const itemsPath = path.join(__dirname, "../../../economy/shop");
      const itemFiles = fs
        .readdirSync(itemsPath)
        .filter((file) => file.endsWith(".json"));

      // Take all items in the shop
      for (const file of itemFiles) {
        const itemData = JSON.parse(
          fs.readFileSync(path.join(itemsPath, file), "utf-8")
        );
        option.addChoices({ name: itemData.name, value: itemData.name });
      }

      return option
        .setName("item")
        .setDescription("Sélectionnez un item à afficher")
        .setRequired(false);
    }),

  async execute(interaction) {
    await interaction.deferReply();

    // Load items
    const shopItemsPath = path.join(__dirname, "../../../economy/shop");
    const shopItems = fs
      .readdirSync(shopItemsPath)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(shopItemsPath, file);
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
      });

    if (shopItems.length === 0) {
      return interaction.editReply(
        "Aucun article n'est disponible dans la boutique !"
      );
    }

    // Item Index
    const selectedItemName =
      interaction.options.getString("item") || shopItems[0].name;
    const selectedItemIndex = shopItems.findIndex(
      (item) => item.name === selectedItemName
    );

    if (selectedItemIndex === -1) {
      return interaction.editReply(
        "L'item sélectionné n'existe pas dans la boutique"
      );
    }

    let currentPage = selectedItemIndex + 1;

    // Generate embed
    const generateEmbed = (page) => {
      const item = shopItems[page - 1];
      const requiredItemID = item.requiredItem || null;
      const requiredItem =
        shopItems.find((shopItem) => shopItem.id === requiredItemID)?.name ||
        "Aucun";
      console.log(requiredItem);
      return new EmbedBuilder()
        .setColor("Blue")
        .setTitle(item.name)
        .setDescription(item.description)
        .addFields(
          {
            name: "Prix",
            value: `${
              item.price || "Non spécifié"
            } <:money:1272567139760472205>`,
            inline: true,
          },
          {
            name: "Stock",
            value:
              item.quantity !== undefined
                ? item.quantity.toString()
                : "Illimité",
            inline: true,
          },
          {
            name: "Maximum d'achat",
            value:
              item.maxQuantity !== undefined
                ? item.maxQuantity.toString()
                : "Illimité",
            inline: true,
          },
          {
            name: "Rôle requis",
            value: item.requiredRole ? `<@&${item.requiredRole}>` : "Aucun",
            inline: true,
          },
          {
            name: "Item requis",
            value: requiredItem || "Aucun",
            inline: true,
          }
        )
        .setFooter({ text: `Page ${page} sur ${shopItems.length}` })
        .setTimestamp();
    };

    // Create buttons
    const generateButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("⬅️ Précédent")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️ Suivant")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === shopItems.length)
      );
    };

    // Send the initial message
    const message = await interaction.editReply({
      embeds: [generateEmbed(currentPage)],
      components: [generateButtons(currentPage)],
    });

    // Timeout collector
    const collector = message.createMessageComponentCollector({
      time: 60000, // 60 sec
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        return buttonInteraction.reply({
          content: "Vous ne pouvez pas interagir avec ce menu",
          ephemeral: true,
        });
      }

      // Get the button interaction
      if (buttonInteraction.customId === "previous") {
        currentPage = Math.max(1, currentPage - 1);
      } else if (buttonInteraction.customId === "next") {
        currentPage = Math.min(shopItems.length, currentPage + 1);
      }

      // Update the message
      await buttonInteraction.update({
        embeds: [generateEmbed(currentPage)],
        components: [generateButtons(currentPage)],
      });
    });

    collector.on("end", () => {
      // Disable all buttons
      message.edit({
        components: [
          generateButtons(currentPage).setComponents(
            ...generateButtons(currentPage).components.map((btn) =>
              btn.setDisabled(true)
            )
          ),
        ],
      });
    });
  },
};

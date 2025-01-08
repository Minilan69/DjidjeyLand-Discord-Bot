const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { log } = require("../../../economy/economy-config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-acheter")
    .setDescription("Achetez un item dans la boutique")
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
        .setDescription("Sélectionnez un item à acheter")
        .setRequired(true);
    })
    .addNumberOption((option) =>
      option
        .setName("quantité")
        .setDescription("Quantité d'item à acheter")
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.user;
    const userid = interaction.user.id;
    const username = interaction.user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });

    const quantity = interaction.options.getNumber("quantité") || 1;

    // Charge selectioned item
    const selectedItemName = interaction.options.getString("item");
    const itemsPath = path.join(__dirname, "../../../economy/shop");
    const itemFiles = fs
      .readdirSync(itemsPath)
      .filter((file) => file.endsWith(".json"));

    let selectedItem;
    let itemPath;

    for (const file of itemFiles) {
      const itemData = JSON.parse(
        fs.readFileSync(path.join(itemsPath, file), "utf-8")
      );
      if (itemData.name === selectedItemName) {
        itemPath = path.join(itemsPath, file);
        selectedItem = itemData;
        break;
      }
    }

    // Charge the user's economy data
    const economyFile = "./economy/economy-data.json";
    const economyData = JSON.parse(fs.readFileSync(economyFile, "utf-8"));
    if (!economyData[userid]) {
      economyData[userid] = { balance: 0};
    }
    if (!economyData[userid].inventory) {
      economyData[userid].inventory = {};
    }

    if (!selectedItem) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({ name: username, iconURL: userAvatar })
        .setDescription(
          `L'item **${selectedItemName}** n'existe pas dans la boutique`
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    selectedItem.quantity = selectedItem.quantity || -1;
    selectedItem.maxQuantity = selectedItem.maxQuantity || -1;

    // Quantity verification
    if (quantity > selectedItem.quantity && selectedItem.quantity != -1) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({ name: username, iconURL: userAvatar })
        .setDescription(
          `Il n'y a pas assez d'item en stock, il en reste **${selectedItem.quantity}**`
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (!economyData[userid].inventory[selectedItem.id]) {
      economyData[userid].inventory[selectedItem.id] = 0;
    }
    if (
      economyData[userid].inventory[selectedItem.id] + quantity >
        selectedItem.maxQuantity &&
      selectedItem.maxQuantity != -1
    ) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({ name: username, iconURL: userAvatar })
        .setDescription(
          `Vous ne pouvez pas en posséder plus de **${
            selectedItem.maxQuantity
          }** ${selectedItemName}, vous en avez déjà **${
            economyData[userid].inventory[selectedItem.id]
          }**`
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    // Check if user has the required role
    if (selectedItem.requiredRole) {
      if (!interaction.member.roles.cache.has(selectedItem.requiredRole)) {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setAuthor({ name: username, iconURL: userAvatar })
          .setDescription(
            `Vous devez posséder le rôle **${interaction.guild.roles.cache.get(
              selectedItem.requiredRole
            )}** pour acheter **${selectedItemName}**`
          )
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
    }

    // Check if the user has the required item
    console.log(selectedItem.requiredItem);
    if (selectedItem.requiredItem) {
      const userRequiredItem =
        economyData[userid].inventory[selectedItem.requiredItem] || 0;
      console.log(userRequiredItem);
      if (userRequiredItem < 1) {
        // Find Name Of Item
        const itemFiles = fs.readdirSync("./economy/shop/");
        const itemFile = itemFiles.find((file) => {
          const itemData = JSON.parse(
            fs.readFileSync(path.join("./economy/shop/", file))
          );
          return itemData.id === parseInt(selectedItem.requiredItem, 10); // Comparer les ID
        });
        
        const itemData = JSON.parse(
          fs.readFileSync(path.join("./economy/shop/", itemFile))
        );
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setAuthor({ name: username, iconURL: userAvatar })
          .setDescription(
            `Vous devez posséder l'item **${itemData.name}** pour acheter **${selectedItemName}**`
          )
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
    }

    const userBalance = economyData[userid].balance;

    // Verify if user has enough money
    if (userBalance < selectedItem.price * quantity) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({ name: username, iconURL: userAvatar })
        .setDescription(
          `Vous n'avez pas assez d'argent pour acheter ${quantity} **${
            selectedItem.name
          }**. Il vous faut **${
            selectedItem.price * quantity
          }** <:money:1272567139760472205>`
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // Data Update
    economyData[userid].inventory[selectedItem.id] += quantity;
    economyData[userid].balance -= selectedItem.price * quantity;
    fs.writeFileSync(economyFile, JSON.stringify(economyData));

    if (selectedItem.quantity != -1) {
      selectedItem.quantity -= quantity;
      fs.writeFileSync(itemPath, JSON.stringify(selectedItem));
    }

    const member = interaction.guild.members.cache.get(userid);

    let message = `Vous avez acheté ${quantity} **${selectedItem.name}** pour **${
      selectedItem.price * quantity
    }** <:money:1272567139760472205> !`;
    try {
      for (const action of selectedItem.actions) {
        switch (action.type) {
          case "assignRole":
            const roleToAdd = interaction.guild.roles.cache.get(action.roleId);
            if (!roleToAdd) {
              throw new Error(
                `The role with ${action.roleId} id does not exist`
              );
            }
            await member.roles.add(roleToAdd);
            break;

          case "removeRole":
            const roleToRemove = interaction.guild.roles.cache.get(
              action.roleId
            );
            if (!roleToRemove) {
              throw new Error(
                `The role with ${action.roleId} id does not exist`
              );
            }
            await member.roles.remove(roleToRemove);
            break;

          case "sendMessage":
            message = action.content;
            break;

          case "addBalance":
            economyData[userid].balance += action.amount;
            fs.writeFileSync(economyFile, JSON.stringify(economyData));
            break;

          default:
            throw new Error(`Action dosent exist : ${action.type}`);
        }
      }

      // Response
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: username, iconURL: userAvatar })
        .setDescription(message)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Log
      const logChannel = interaction.guild.channels.cache.get(log);
      if (logChannel) {
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setAuthor({ name: username, iconURL: userAvatar })
              .setDescription(
                `Amount : **-${selectedItem.price}** <:money:1272567139760472205>\n Reason : **Buy ${quantity} ${selectedItem.name}**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      interaction.client.logger.error("Buy", error);
      return interaction.editReply(
        `❌ Une erreur est survenue lors de l'achat de **${quantity} ${selectedItem.name}**. Veuillez réessayer plus tard`
      );
    }
  },
};

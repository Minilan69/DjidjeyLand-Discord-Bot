const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const { log } = require("../../../economy/economy-config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-give-item")
    .setDescription("Donner un item à quelqu'un")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à qui vous voulez donner l'item")
        .setRequired(true)
    )
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
        .setDescription("Sélectionnez un item à donner")
        .setRequired(true);
    })
    .addIntegerOption((option) =>
      option
        .setName("quantité")
        .setDescription("Quantité d'item à donner")
        .setRequired(false)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser("membre");
    const userid = user.id;
    const username = interaction.user.username;
    const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });

    const quantity = interaction.options.getInteger("quantité") || 1;

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

    // Charge the user's economy data
    const economyFile = "./economy/economy-data.json";
    const economyData = JSON.parse(fs.readFileSync(economyFile, "utf-8"));
    if (!economyData[userid].inventory) {
      economyData[userid].inventory = {};
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
          `Il ne peux pas en posséder plus de **${
            selectedItem.maxQuantity
          }** ${selectedItemName}, il en a déjà **${
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
            `Il doit posséder le rôle **${interaction.guild.roles.cache.get(
              selectedItem.requiredRole
            )}** pour que vous puissiez lui donner **${selectedItemName}**`
          )
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
    }

    // Data Update
    economyData[userid].inventory[selectedItem.id] += quantity;
    fs.writeFileSync(economyFile, JSON.stringify(economyData));

    if (selectedItem.quantity != -1) {
      selectedItem.quantity -= quantity;
      fs.writeFileSync(itemPath, JSON.stringify(selectedItem));
    }

    const member = interaction.guild.members.cache.get(userid);

    let message = `Vous avez donner **${quantity} ${selectedItem.name}** à **${user}** !`;
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
              .setColor("Blue")
              .setAuthor({ name: username, iconURL: userAvatar })
              .setDescription(
                `Give : **${quantity} ${selectedItem.name}**\n To : **${user}**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      interaction.client.logger.error("Buy", error);
      embederror = new EmbedBuilder()
        .setColor("RED")
        .setAuthor({ name: username, iconURL: userAvatar })
        .setDescription(
          `❌ Une erreur est survenue lors du give de **${selectedItem.name}**. Veuillez réessayer plus tard`
        )
        .setTimestamp();
      return interaction.editReply({ embeds: [embederror] }
      );
    }
  },
};

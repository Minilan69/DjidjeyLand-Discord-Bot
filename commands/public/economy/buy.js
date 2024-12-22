const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { log } = require("../../../economy/economy-config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
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
    }),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.user;
    const userid = interaction.user.id;
    const username = interaction.user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });

    // Charge selectioned item
    const selectedItemName = interaction.options.getString("item");
    const itemsPath = path.join(__dirname, "../../../economy/shop");
    const itemFiles = fs
      .readdirSync(itemsPath)
      .filter((file) => file.endsWith(".json"));

    let selectedItem;

    for (const file of itemFiles) {
      const itemData = JSON.parse(
        fs.readFileSync(path.join(itemsPath, file), "utf-8")
      );
      if (itemData.name === selectedItemName) {
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

    // Charge the user's economy data
    const economyFile = "./economy/economy-data.json";
    const economyData = JSON.parse(fs.readFileSync(economyFile, "utf-8"));
    if (!economyData[userid]) {
      economyData[userid] = { balance: 0 };
    }

    const userBalance = economyData[userid].balance;

    // Verify if user has enough money
    if (userBalance < selectedItem.price) {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setAuthor({ name: username, iconURL: userAvatar })
          .setDescription(
            `Vous n'avez pas assez d'argent pour acheter **${selectedItem.name}**. Il vous faut **${selectedItem.price}** <:money:1272567139760472205>`
          )
          .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // Sold Update
    economyData[userid].balance -= selectedItem.price;
    fs.writeFileSync(economyFile, JSON.stringify(economyData));

    const member = interaction.guild.members.cache.get(userid);

    let message = `Vous avez acheté **${selectedItem.name}** pour **${selectedItem.price}** <:money:1272567139760472205> !`;
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
      if (logChannel && selectedItem.price != 0) {
        logChannel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setAuthor({ name: username, iconURL: userAvatar })
              .setDescription(
                `Amount : **-${selectedItem.price}** <:money:1272567139760472205>\n Reason : **Buy ${selectedItem.name}**`
              )
              .setTimestamp(),
          ],
        });
      }
    } catch (error) {
      console.error("[❌ERROR]", error);
      return interaction.editReply(
        `❌ Une erreur est survenue lors de l'achat de **${selectedItem.name}**. Veuillez réessayer plus tard`
      );
    }
  },
};

// Add fields to embed
// Imports
const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-aide-modo")
    .setDescription(
      "Affiche la liste des commandes disponibles pour les modérateurs"
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.options.getUser("membre") || interaction.user;
    const userName = user.username;
    const userAvatar = user.displayAvatarURL({ dynamic: true });

    const client = interaction.client;

    const publicFolderPath = path.join(__dirname, "..");
    const subFolders = fs.readdirSync(publicFolderPath);

    // Embed
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setAuthor({ name: userName, iconURL: userAvatar })
      .setDescription("Voici la liste des commandes disponibles")
      .setTimestamp();

    // View all commands
    for (const subFolder of subFolders) {
      const subFolderPath = path.join(publicFolderPath, subFolder);
      const commandFiles = fs
        .readdirSync(subFolderPath)
        .filter((file) => file.endsWith(".js"));

      if (commandFiles.length > 0) {
        let fieldValue = "";

        // View all commands in the sub-folder
        for (const file of commandFiles) {
          const filePath = path.join(subFolderPath, file);
          const command = require(filePath);

          if ("data" in command && "execute" in command) {
            fieldValue += `\`/${command.data.name}\` - ${command.data.description}\n`;
          } else {
            client.logger.warn(
              "HelpM",
              `[❗WARNING] ${filePath} missing property`
            );
          }
        }

        // Add fields to embed
        embed.addFields({
          name: `${subFolder.charAt(0).toUpperCase() + subFolder.slice(1)}`,
          value: fieldValue || "Aucune commande disponible",
          inline: false,
        });
      }
    }

    // Reply
    await interaction.editReply({ embeds: [embed] });
  },
};
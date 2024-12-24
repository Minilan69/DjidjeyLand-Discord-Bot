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
    .setName("helpa")
    .setDescription("Affiche la liste des commandes disponibles pour les administrateurs")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;

    const publicFolderPath = path.join(__dirname, "..");
    const subFolders = fs.readdirSync(publicFolderPath);

    // Embed
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Commandes disponibles")
      .setDescription("Voici la liste des commandes disponibles pour les administrateurs")
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
            client.logger.warn("HelpA", `[❗WARNING] ${filePath} missing property`);
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

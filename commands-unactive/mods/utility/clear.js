// Imports
const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-clear")
    .setDescription("Supprimer un nombre spécifié de messages")
    .addIntegerOption((option) =>
      option
        .setName("nombre")
        .setDescription("Le nombre de messages à supprimer")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  // Execution
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Variables
    const amount = interaction.options.getInteger("nombre");

    try {
      // Delete messages
      const deletedMessages = await interaction.channel.bulkDelete(
        amount,
        true
      );

      // Embed
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Messages Supprimés")
        .setDescription((deletedMessages.size === 1) ? `✅ 1 message a été supprimé` : `✅ ${deletedMessages.size} messages ont été supprimés`)
        .setTimestamp();

      // Message
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);

      // Error Embed
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Erreur")
        .setDescription(
          "Une erreur s'est produite lors de la suppression des messages. Vérifiez que les messages à supprimer datent de moins de 14 jours"
        )
        .setFooter({
          text: "Vérifiez vos permissions ou contactez un administrateur",
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

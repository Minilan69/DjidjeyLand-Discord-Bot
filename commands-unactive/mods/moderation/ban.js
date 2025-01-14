// Imports
const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-ban")
    .setDescription("Permet de ban un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du ban")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

  // Execution
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.options.getUser("membre");
    const reason = interaction.options.getString("raison");

    const member = await interaction.guild.members.fetch(user.id);
    const name =
      interaction.member.nickname ||
      interaction.member.user.globalName ||
      interaction.member.user.username ||
      "Pseudo Non Récupérable";

    // Verify is not an admin
    if (member.roles.cache.has("1276506416978464821")) {
      return interaction.editReply({
        content: "❌ Vous ne pouvez pas ban un staff",
        ephemeral: true,
      });
    }

    // Verify if the user is not the bot
    if (member.user.id === interaction.client.user.id) {
      return interaction.editReply("❌ Vous ne pouvez pas ban le bot");
    }

    // Verify if the user is not the caller
    if (user.id === interaction.user.id) {
      return interaction.editReply({
        content: "❌ Tu ne peux pas te ban toi-même",
        ephemeral: true,
      });
    }
    try {
      // Ban the user
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: "BAN",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(
          `${user} a été banni avec succès\n **Raison :** ${reason}`
        )
        .setTimestamp();

      await member.ban({
        reason: `Par ${name} : ${reason}`,
        deleteMessageSeconds: 0,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Error
      interaction.client.logger.error("Ban", error);
      await interaction.editReply("❌ Impossible de ban le membre");
    }
  },
};

// Imports
const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-kick")
    .setDescription("Permet de kick un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du kick")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),

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
        content: "❌ Vous ne pouvez pas kick un staff",
        ephemeral: true,
      });
    }

    // Verify if the user is not the bot
    if (member.user.id === interaction.client.user.id) {
      return interaction.editReply("❌ Vous ne pouvez pas kick le bot");
    }

    // Verify if the user is not the caller
    if (user.id === interaction.user.id) {
      return interaction.editReply({
        content: "❌ Tu ne peux pas te kick toi-même",
        ephemeral: true,
      });
    }

    // Kick User
    try {
      member.kick(`Par ${name} : ${reason}`);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: "KICK",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(
          `${user} a été kick avec succès\n **Raison :** ${reason}`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Error
      interaction.client.logger.error("Kick", error);
      await interaction.editReply("❌ Impossible de kick le membre");
    }
  },
};

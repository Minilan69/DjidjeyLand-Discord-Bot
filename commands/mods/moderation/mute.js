// Imports
const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Permet de mute un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à mute")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("durée")
        .setDescription("La durée en minutes du mute")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du mute")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers),
  // Execution
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.options.getUser("membre");
    const time = interaction.options.getNumber("durée");
    const reason = interaction.options.getString("raison");

    const member = await interaction.guild.members.fetch(user.id);
    const mute = member.communicationDisabledUntilTimestamp;
    const name =
      interaction.member.nickname ||
      interaction.member.user.globalName ||
      interaction.member.user.username ||
      "Pseudo Non Récupérable";

    // Verify is not an admin
    if (member.roles.cache.has("1276506416978464821")) {
      return interaction.editReply({
        content: "❌ Vous ne pouvez pas mute un staff",
        ephemeral: true,
      });
    }

    // Verify if the user is not the bot
    if (member.user.id === interaction.client.user.id) {
      return interaction.editReply("❌ Vous ne pouvez pas mute le bot");
    }

    // Verify if the user is not the caller
    if (user.id === interaction.user.id) {
      return interaction.editReply({
        content: "❌ Tu ne peux pas te mute toi-même",
        ephemeral: true,
      });
    }

    // Verify if the user is muted
    if (mute) {
      return interaction.editReply({
        content: "❌ Ce membre est déja mute",
        ephemeral: true,
      });
    }

    // Kick User
    try {
      member.timeout(time * 60000, `Par ${name} : ${reason}`);
      await interaction.editReply(
        `✅ <@${user.id}> a été mute pour ${time} minutes
        Raison: ${reason}`
      );
    } catch (error) {
      // Error
      interaction.client.logger.error("Mute", error);
      await interaction.editReply("❌ Impossible de mute le membre");
    }
  },
};

// Imports
const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-unmute")
    .setDescription("Permet de unmute un membre")
    .addUserOption((option) =>
      option
        .setName("membre")
        .setDescription("Le membre à unmute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("raison")
        .setDescription("La raison du unmute")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers),
  // Execution
  async execute(interaction) {
    await interaction.deferReply();

    // Variables
    const user = interaction.options.getUser("membre");
    const reason = interaction.options.getString("raison");

    const member = await interaction.guild.members.fetch(user.id);
    const time = member.communicationDisabledUntilTimestamp;
    const name =
      interaction.member.nickname ||
      interaction.member.user.globalName ||
      interaction.member.user.username ||
      "Pseudo Non Récupérable";

    // Verify is not an admin
    if (member.roles.cache.has("1276506416978464821")) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "UNMUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Vous ne pouvez pas unmute un staff")
        .setTimestamp();
      return interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // Verify if the user is not the bot
    if (member.user.id === interaction.client.user.id) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "UNMUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Vous ne pouvez pas unmute le bot")
        .setTimestamp();
      return interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // Verify if the user is not the caller
    if (user.id === interaction.user.id) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "UNMUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Vous ne pouvez pas vous unmute")
        .setTimestamp();
      return interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // Verify if the user is muted
    if (!time) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "UNMUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Ce membre n'est pas mute")
        .setTimestamp();
      return interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // Unmute User
    try {
      member.timeout(null, `Par ${name} : ${reason}`);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: "UNMUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(
          `${user} a été unmute avec succès\n **Raison :** ${reason}`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Error
      interaction.client.logger.error("Unmute", error);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "UNMUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Impossible de unmute le membre")
      await interaction.editReply({embeds: [embed], ephemeral: true});
    }
  },
};

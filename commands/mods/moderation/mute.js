// Imports
const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dl-mute")
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
    if (member.roles.cache.has("1276506416978464821")) {$
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "MUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Vous ne pouvez pas mute un staff")
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
          name: "MUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Vous ne pouvez pas mute le bot")
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
          name: "MUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Tu ne peux pas te mute toi-même")
        .setTimestamp();
      return interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // Verify if the user is muted
    if (mute) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "MUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(`${user} est déja mute`)
        .setTimestamp();
      return interaction.editReply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // Mute User
    try {
      member.timeout(time * 60000, `Par ${name} : ${reason}`);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: "MUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription(
          `${user} a été mute avec succès\n **Raison :** ${reason}`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Error
      interaction.client.logger.error("Mute", error);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({
          name: "MUTE",
          iconURL: user.displayAvatarURL(),
        })
        .setDescription("Impossible de mute le membre")
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] , ephemeral: true});
    }
  },
};

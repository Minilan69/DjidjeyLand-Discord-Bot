// Imports
const { Events, AttachmentBuilder } = require("discord.js");

// Event Responde
module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Variables
    const client = member.client;
    const channelId = "1275973666521219132";
    const channel = member.guild.channels.cache.get(channelId);
    const name =
      member.nickname ||
      member.user.globalName ||
      member.user.username ||
      "Pseudo Non Récupérable";
    //Image
    const avatarUrl = member.user.displayAvatarURL({
      format: "png",
      dynamic: true,
      size: 256,
    });
    const footer = new AttachmentBuilder("assets/serv-icon.png");

    // Channel Not Found
    if (!channel) {
      client.logger.error("MemberJoin", "Welcome channel not found");
      return;
    }

    // Embed
    const embed = {
      color: 0x8b0000,
      title: `👋 ${name} vien de rejoindre !`,
      description: `🎉 **<@${member.user.id}>** bienvenue sur Djidjeyland ! 🎉

Tu viens d'arriver sur **Djidjeyland**, un serveur chill où tu peux discuter, t'amuser et participer à plein d'activités avec la communauté ! 😎  
Explore nos différents canaux et participe aux événements 🎮

Si tu as des questions, n'hésite pas à demander !  
Profite bien de ton aventure ici ! 🌟`,
      thumbnail: { url: avatarUrl },
      footer: {
        text: `Vien discuter avec nous ${name} !`,
        icon_url: "attachment://serv-icon.png",
      },
    };

    // Send Message
    try {
      channel.send({
        content: `<@${member.user.id}>`,
        embeds: [embed],
        files: [footer],
      });
      client.logger.ok("MemberJoin", `${member.user.tag} join server`);
    } catch (error) {
      // Error
      client.logger.error("MemberJoin", error);
    }
  },
};

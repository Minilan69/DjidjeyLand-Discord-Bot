// Imports
const { Events, PermissionsBitField } = require("discord.js");

// Event Responde
module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (
      message.content.trim().endsWith(`<@${message.client.user.id}>`) && // See if the bot is mentioned at the end
      message.member.permissions.has(PermissionsBitField.Flags.MuteMembers) && // Verify if the author is admin
      message.author.id !== message.client.user.id // Check if the author is not the bot
    ) {

      // Variables
      const contentWithoutMention = message.content
        .replace(`<@${message.client.user.id}>`, "")
        .trim();
      const attachmentUrls = message.attachments.map(
        (attachment) => attachment.url
      );
      const embeds = message.embeds;

      try {
        // Empty Message
        if (!contentWithoutMention && attachmentUrls.length === 0) {
          return message.reply("❌ Un message ne peut pas être vide");
        }

        // Message Length
        if (contentWithoutMention.length > 2000 || attachmentUrls.length > 10) {
          return message.reply(
            `❌ Le message ne peut pas dépasser 2000(${contentWithoutMention.length}) caractères et les pièces jointes ne peuvent pas dépasser 10(${attachmentUrls.length})`
          );
        }

        // Message
        await message.delete();
        await message.channel.send({
          content: contentWithoutMention,
          files: attachmentUrls,
          embeds: embeds,
        });
        message.client.logger.ok("BotPing", `${message.member.user.username} sent a message`);
      } catch (error) {
        // Error
        console.error("[❌ERROR]", error);
        await message.reply("❌ Impossible d'envoyer le message");
      }
    }
  },
};

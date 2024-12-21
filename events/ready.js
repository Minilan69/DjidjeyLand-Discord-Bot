// Imports
const { Events } = require("discord.js");

// Event Responder
module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    // Variables
    const launchTime = new Date();
    const channelId = "1272561844741214270";
    const roleId = "594552679397851137";
    const channel = client.channels.cache.get(channelId);

    // Console
    console.log(
      `[✅PASS] ${
        client.user.username
      } launched at ${launchTime.toLocaleTimeString()} the ${launchTime.toLocaleDateString()}`
    );

    // Message
    if (channel) {
      try {
        channel.send({
          content: `✅ **${
            client.user.username
          }** a bien été lancé à ${launchTime.toLocaleTimeString()} le ${launchTime.toLocaleDateString()} ! <@&${roleId}>`,
        });
      } catch (error) {
        // Error
        console.error("[❌ERROR] Can't Send Message", error);
      }
    } else {
      // Error
      console.error(`[❌ERROR] Channel "${channelId}" missing`);
    }
  },
};

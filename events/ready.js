// Imports
const { Events } = require("discord.js");
const moment = require("moment")
moment.locale("fr")

// Event Responder
module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    // Variables
    const launchTime = new Date();
    let day = moment().format("DD/MM/YYYY")
    let hour = moment().format("HH:mm:ss")

    // Console
    console.log(
      `[✅PASS] ${
        client.user.username
      } launched at ${launchTime.toLocaleTimeString()} the ${launchTime.toLocaleDateString()}`
    );

    // Message
    if (client.config.ready.channel) {
      let channel = client.channels.cache.get(client.config.ready.channel)
      if(!channel) return client.logger.error("[Events/Ready]", "Un salon invalide a été spécifié")
      let content = client.config.ready.message
      content = content.replaceAll("{date}", day)
      content = content.replaceAll("{time}", hour)
      content = content.replaceAll("{botName}", client.user.username)
      channel.send(content)
    }
    else {
      client.logger.warn("[Events/Ready]", "Aucun salon d'envoi n'a été spécifié")
    }
  },
};

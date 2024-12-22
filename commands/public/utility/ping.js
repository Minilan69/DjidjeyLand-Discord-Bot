// Imports
const { SlashCommandBuilder } = require("discord.js");
const process = require("process");

// Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription(
      "Affiche le ping du bot et les informations du serveur distant"
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const sent = await interaction.followUp({
      content: "Calcul en cours...",
      fetchReply: true,
    });

    try {
      // Collect Data
      const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
      let apiLatency = Math.ceil(interaction.client.ws.ping);
      if (apiLatency == -1) {
        apiLatency = 0;
      }
      const botUptime = formatUptime(process.uptime());

      // Message
      await interaction.editReply(
        `
        🔹 **Ping du bot :** ${botLatency}ms\n🔹 **Latence API Discord :** ${apiLatency}ms\n🔹 **Uptime du bot :** ${botUptime}
        `
      );
    } catch (error) {
      // Error
      console.error("[❌ERROR]", error);
      await interaction.editReply("❌ Impossible de ping");
    }
  },
};

// Formate UpTime
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}j ${h}h ${m}m ${s}s`;
}

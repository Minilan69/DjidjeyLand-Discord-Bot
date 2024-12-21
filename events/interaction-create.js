// Imports
const { Events, MessageFlags } = require("discord.js");

// Event Responde
module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // Variables
    const allowedChannels = ["1272379003151319100", "1272561844741214270"];
    const command = interaction.client.commands.get(interaction.commandName);

    // Command Not Allowed
    if (!allowedChannels.includes(interaction.channelId)) {
      return interaction.reply({
        content:
          "❌ Les commandes ne peuvent être uniquement utilisée que dans certains salons",
        ephemeral: true,
      });
    }

    // Command Don't Exist
    if (!command) {
      console.error(
        `[❌ERROR] ${interaction.commandName} no command with this name`
      );
      return;
    }

    try {
      // Command Execution
      await command.execute(interaction);
      console.log(`[✅PASS] ${interaction.commandName}.js sucseed`);
    } catch (error) {
      // Error
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ Ta commande n'a pas pu aboutir, désolé !",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "❌ Ta commande n'a pas pu aboutir, désolé !",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};

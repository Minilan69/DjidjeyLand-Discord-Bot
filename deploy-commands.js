// Imports
const { Routes, PermissionsBitField } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("fs");
const path = require("path");

// Commands List
async function getCommands() {
  const commands = [];
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      // Admin's Commands
      if (folder === "admins") {
        command.data.default_member_permissions =
          PermissionsBitField.Flags.BanMembers.toString();
      }

      // Have All Property
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[❗WARNING] ${filePath} missing property`);
      }
    }
  }

  return commands;
}

// Update Commands
async function deployCommands() {
  const commands = await getCommands();

  const { REST } = require("@discordjs/rest");
  const rest = new REST({ timeout: 60000 }).setToken(token);

  try {
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: commands,
      }
    );

    console.log(`[✅PASS] ${data.length} commands created`);
  } catch (error) {
    // Error
    console.error("[❌ERROR]", error);
  }
}

// Export
module.exports = {
  deployCommands,
};

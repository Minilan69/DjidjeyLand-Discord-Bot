// Imports
const { Routes, PermissionsBitField } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("fs");
const path = require("path");
const Logger = require("./util/Logger")

// Commands List
async function getCommands() {
  const commands = [];
  const foldersPath = path.join(__dirname, "commands");
  const commandCategories = fs.readdirSync(foldersPath);

  for (const category of commandCategories) {
    const categoryPath = path.join(foldersPath, category);
    const categoryFolders = fs.readdirSync(categoryPath);

    for (const folder of categoryFolders) {
      const commandFiles = fs
        .readdirSync(path.join(categoryPath, folder))
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const filePath = path.join(categoryPath, folder, file);
        const command = require(filePath);
        
        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());
        } else {
          Logger.error("[Commands]", `${filePath}: il manque les propriétés "data" ou "execute"`)
          Logger.wait("[Commands]", "Construction des commandes...")
        }
      }
    }
  }

  return commands;
}

// Update Commands
async function deployCommands() {
  return new Promise(async (resolve) => {
    Logger.wait("[Commands]", "Construction des commandes...")
    const commands = await getCommands();
    Logger.ok("[Commands]", `${commands.length} commandes construites       `)
    Logger.wait("[Commands]", "Enregistrement des commandes...")
    const { REST } = require("@discordjs/rest");
    const rest = new REST({ timeout: 60000 }).setToken(token);

    try {
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        {
          body: commands,
        }
      )

      Logger.ok("[Commands]", `${data.length} commandes enregistrées      `)
      resolve()
    } catch (error) {
      // Error
      Logger.error("[Commands]", "Une erreur est survenue lors de l'enregistrement des commandes")
      Logger.error("[Commands]", error)
      process.exit(1)
    }
  })
}

// Export
module.exports = {
  deployCommands,
};

// Imports
const { Routes, PermissionsBitField } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("fs");
const path = require("path");

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

        // Set Default Permissions
        if (category === "admins") {
          command.data.default_member_permissions =
            PermissionsBitField.Flags.Administrator.toString();
        } else if (category === "mods") {
          command.data.default_member_permissions =
            PermissionsBitField.Flags.BanMembers.toString();
        }

        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());
        } else {
          console.log(
            `[❗WARNING] ${filePath} missing 'data' or 'execute' property`
          );
        }
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

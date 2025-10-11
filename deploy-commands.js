const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];

// Grab all the command files from the commands directory
const foldersPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`❌ [WARNING] Command at ${filePath} missing required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands!
(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        // Check if CLIENT_ID is provided
        if (!process.env.CLIENT_ID) {
            console.error('❌ CLIENT_ID not found in .env file!');
            console.log('📝 Please add CLIENT_ID=your_bot_client_id to your .env file');
            process.exit(1);
        }

        let data;
        
        // If GUILD_ID is provided, deploy to specific guild (faster for testing)
        if (process.env.GUILD_ID) {
            console.log(`📍 Deploying to guild: ${process.env.GUILD_ID}`);
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
        } else {
            // Deploy globally (takes up to 1 hour to update)
            console.log('🌍 Deploying globally...');
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
        }

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
        
        if (process.env.GUILD_ID) {
            console.log('🚀 Guild commands should appear immediately!');
        } else {
            console.log('⏰ Global commands may take up to 1 hour to appear in all servers.');
        }

    } catch (error) {
        console.error('❌ Error deploying commands:', error);
        
        if (error.code === 50001) {
            console.log('💡 Bot doesn\'t have access to the guild. Make sure the bot is invited to the server!');
        } else if (error.code === 10003) {
            console.log('💡 Unknown channel. Check your GUILD_ID in .env file.');
        }
    }
})();
const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const config = require('./config.json');

// Membuat client Discord dengan intents yang diperlukan
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Collection untuk menyimpan commands
client.commands = new Collection();

// Load command files
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`❌ [WARNING] Command at ${filePath} missing required "data" or "execute" property.`);
    }
}

// Event ketika bot siap
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} telah online!`);
    console.log(`📊 Bot ada di ${client.guilds.cache.size} server`);
    console.log(`👥 Bot dapat dilihat oleh ${client.users.cache.size} users`);
    
    // Set status bot
    client.user.setActivity(config.status.name, { type: config.status.type });
    
    console.log('💡 Untuk mendaftarkan slash commands, jalankan: npm run deploy');
});

// Event untuk interaksi slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const errorMessage = '❌ Terjadi error saat menjalankan command!';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Event untuk pesan biasa (prefix commands)
client.on('messageCreate', async message => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if message starts with prefix
    if (!message.content.startsWith(config.prefix)) return;
    
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    // Legacy prefix commands
    switch (command) {
        case 'ping':
            const ping = client.ws.ping;
            const embed = new EmbedBuilder()
                .setTitle('🏓 Pong!')
                .setDescription(`**Latency:** ${ping}ms`)
                .setColor(config.color)
                .setTimestamp()
                .setFooter({ text: config.embedFooter });
            
            message.reply({ embeds: [embed] });
            break;
            
        case 'say':
            if (!args.length) {
                return message.reply('❌ Mohon berikan pesan yang ingin diulang!');
            }
            message.channel.send(args.join(' '));
            break;
    }
});

// Event untuk member baru bergabung
client.on('guildMemberAdd', member => {
    console.log(`✅ ${member.user.tag} bergabung ke ${member.guild.name}`);
    
    // Cari channel welcome (optional)
    const welcomeChannel = member.guild.channels.cache.find(
        channel => channel.name === 'welcome' || channel.name === 'general'
    );
    
    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎉 Selamat Datang!')
            .setDescription(`Selamat datang di **${member.guild.name}**, ${member}!`)
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(config.color)
            .setTimestamp()
            .setFooter({ text: config.embedFooter });
        
        welcomeChannel.send({ embeds: [welcomeEmbed] });
    }
});

// Event untuk member keluar
client.on('guildMemberRemove', member => {
    console.log(`❌ ${member.user.tag} keluar dari ${member.guild.name}`);
});

// Error handling
client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
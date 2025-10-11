const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const config = require('./config.json');
const ActionLogger = require('./src/utils/actionLogger');

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

// Initialize Action Logger
const logger = new ActionLogger(client);

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

// Event untuk interaksi (slash commands dan buttons)
client.on('interactionCreate', async interaction => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
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
        return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
        // Verification button handler
        if (interaction.customId === 'verify_button') {
            const verifyRoleId = '1423692148313690224';
            const verifyRole = interaction.guild.roles.cache.get(verifyRoleId);
            
            if (!verifyRole) {
                return interaction.reply({
                    content: '❌ Role verifikasi tidak ditemukan! Hubungi administrator.',
                    ephemeral: true
                });
            }
            
            // Check if user already has the role
            if (interaction.member.roles.cache.has(verifyRoleId)) {
                return interaction.reply({
                    content: '✅ Anda sudah terverifikasi!',
                    ephemeral: true
                });
            }
            
            try {
                // Add role to member
                await interaction.member.roles.add(verifyRole);
                
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Verifikasi Berhasil!')
                    .setDescription(`Selamat! Anda telah berhasil diverifikasi dan mendapatkan role **${verifyRole.name}**.\n\n` +
                        'Sekarang Anda memiliki akses penuh ke server ini. Selamat bergabung! 🎉')
                    .setColor('#00ff00')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ text: 'Selamat bergabung di komunitas kami!' })
                    .setTimestamp();
                
                await interaction.reply({
                    embeds: [successEmbed],
                    ephemeral: true
                });
                
                console.log(`✅ ${interaction.user.tag} berhasil diverifikasi dan mendapat role ${verifyRole.name}`);
                
            } catch (error) {
                console.error('Error adding verification role:', error);
                await interaction.reply({
                    content: '❌ Terjadi error saat memberikan role verifikasi. Hubungi administrator!',
                    ephemeral: true
                });
            }
        }
        return;
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

// Action Logging Events
client.on('guildMemberAdd', async member => {
    console.log(`✅ ${member.user.tag} bergabung ke ${member.guild.name}`);
    
    // Log member join
    await logger.logMemberJoin(member);
    
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

client.on('guildMemberRemove', async member => {
    console.log(`❌ ${member.user.tag} keluar dari ${member.guild.name}`);
    
    // Log member leave
    await logger.logMemberLeave(member);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    // Log member updates (nickname, roles)
    await logger.logMemberUpdate(oldMember, newMember);
});

client.on('channelCreate', async channel => {
    console.log(`✅ Channel ${channel.name} dibuat di ${channel.guild.name}`);
    
    // Log channel creation
    await logger.logChannelCreate(channel);
});

client.on('channelDelete', async channel => {
    console.log(`❌ Channel ${channel.name} dihapus di ${channel.guild.name}`);
    
    // Log channel deletion
    await logger.logChannelDelete(channel);
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    // Log channel updates
    await logger.logChannelUpdate(oldChannel, newChannel);
});

client.on('messageDelete', async message => {
    if (!message.guild || message.author?.bot) return;
    
    // Log message deletion
    await logger.logMessageDelete(message);
});

client.on('guildBanAdd', async ban => {
    console.log(`❌ ${ban.user.tag} dibanned dari ${ban.guild.name}`);
    
    // Log member ban
    await logger.logBanAdd(ban);
});

client.on('guildBanRemove', async ban => {
    console.log(`✅ ${ban.user.tag} di-unban dari ${ban.guild.name}`);
    
    // Log member unban
    await logger.logBanRemove(ban);
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
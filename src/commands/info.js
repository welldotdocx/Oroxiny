const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Menampilkan informasi tentang bot'),
    
    async execute(interaction) {
        const client = interaction.client;
        
        const infoEmbed = new EmbedBuilder()
            .setTitle('ℹ️ Informasi Bot')
            .setDescription('Bot Discord sederhana yang dibuat dengan Discord.js')
            .addFields(
                { name: '👤 Nama Bot', value: client.user.tag, inline: true },
                { name: '🆔 Bot ID', value: client.user.id, inline: true },
                { name: '📅 Dibuat', value: client.user.createdAt.toLocaleDateString('id-ID'), inline: true },
                { name: '📊 Servers', value: client.guilds.cache.size.toString(), inline: true },
                { name: '👥 Users', value: client.users.cache.size.toString(), inline: true },
                { name: '🏓 Latency', value: `${client.ws.ping}ms`, inline: true }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setColor(config.color)
            .setTimestamp()
            .setFooter({ text: config.embedFooter });
        
        await interaction.reply({ embeds: [infoEmbed] });
    },
};
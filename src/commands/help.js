const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan daftar semua commands'),
    
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setTitle('📚 Daftar Commands')
            .setDescription('Berikut adalah semua commands yang tersedia:')
            .addFields(
                { name: '/ping', value: 'Cek latency bot', inline: true },
                { name: '/help', value: 'Menampilkan bantuan ini', inline: true },
                { name: '/info', value: 'Info tentang bot', inline: true },
                { name: '/server', value: 'Info tentang server', inline: true },
                { name: '/user', value: 'Info tentang user', inline: true },
                { name: '/say', value: 'Bot mengulang pesan Anda', inline: true }
            )
            .setColor(config.color)
            .setTimestamp()
            .setFooter({ text: config.embedFooter });
        
        await interaction.reply({ embeds: [helpEmbed] });
    },
};
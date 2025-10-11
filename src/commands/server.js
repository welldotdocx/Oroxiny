const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Menampilkan informasi tentang server'),
    
    async execute(interaction) {
        const { guild } = interaction;
        
        const serverEmbed = new EmbedBuilder()
            .setTitle(`🏠 ${guild.name}`)
            .setDescription('Informasi tentang server ini')
            .addFields(
                { name: '👤 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 Members', value: guild.memberCount.toString(), inline: true },
                { name: '📅 Dibuat', value: guild.createdAt.toLocaleDateString('id-ID'), inline: true },
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '🌍 Region', value: 'Auto', inline: true },
                { name: '🔒 Verification Level', value: guild.verificationLevel.toString(), inline: true }
            )
            .setThumbnail(guild.iconURL())
            .setColor(config.color)
            .setTimestamp()
            .setFooter({ text: config.embedFooter });
        
        await interaction.reply({ embeds: [serverEmbed] });
    },
};
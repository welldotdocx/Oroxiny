const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Menampilkan informasi tentang user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User yang ingin dilihat info-nya')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const { user, guild } = interaction;
        const targetUser = interaction.options.getUser('target') || user;
        const member = guild.members.cache.get(targetUser.id);
        
        const userEmbed = new EmbedBuilder()
            .setTitle(`👤 ${targetUser.tag}`)
            .setDescription('Informasi tentang user ini')
            .addFields(
                { name: '🆔 User ID', value: targetUser.id, inline: true },
                { name: '📅 Akun Dibuat', value: targetUser.createdAt.toLocaleDateString('id-ID'), inline: true },
                { name: '📅 Bergabung Server', value: member ? member.joinedAt.toLocaleDateString('id-ID') : 'N/A', inline: true },
                { name: '🎭 Nickname', value: member ? (member.nickname || 'Tidak ada') : 'N/A', inline: true },
                { name: '🎨 Role Tertinggi', value: member ? member.roles.highest.name : 'N/A', inline: true },
                { name: '🤖 Bot?', value: targetUser.bot ? 'Ya' : 'Tidak', inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setColor(config.color)
            .setTimestamp()
            .setFooter({ text: config.embedFooter });
        
        await interaction.reply({ embeds: [userEmbed] });
    },
};
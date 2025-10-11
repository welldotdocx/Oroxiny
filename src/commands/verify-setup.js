const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify-setup')
        .setDescription('Setup verification system in the verify channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ Anda tidak memiliki permission untuk menggunakan command ini!',
                ephemeral: true
            });
        }

        // Target channel ID untuk verifikasi
        const verifyChannelId = '1423699712640291048';
        const verifyChannel = interaction.guild.channels.cache.get(verifyChannelId);

        if (!verifyChannel) {
            return interaction.reply({
                content: `❌ Channel verifikasi dengan ID \`${verifyChannelId}\` tidak ditemukan!`,
                ephemeral: true
            });
        }

        // Buat embed untuk verifikasi
        const verifyEmbed = new EmbedBuilder()
            .setTitle('🛡️ Sistem Verifikasi Server')
            .setDescription(`Selamat datang di **${interaction.guild.name}**!\n\n` +
                '**Untuk mendapatkan akses penuh ke server ini, silakan klik tombol "Verifikasi" di bawah.**\n\n' +
                '✅ Setelah verifikasi, Anda akan mendapatkan role yang memberikan akses ke semua channel.\n' +
                '🔒 Verifikasi membantu menjaga keamanan server dari spam dan bot jahat.\n\n' +
                '**Klik tombol di bawah untuk memulai verifikasi:**')
            .setColor(config.color)
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ 
                text: 'Sistem verifikasi otomatis • Klik sekali saja',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        // Buat button untuk verifikasi
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('✅ Verifikasi')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🛡️');

        const actionRow = new ActionRowBuilder()
            .addComponents(verifyButton);

        try {
            // Kirim embed dan button ke channel verifikasi
            await verifyChannel.send({
                embeds: [verifyEmbed],
                components: [actionRow]
            });

            await interaction.reply({
                content: `✅ Sistem verifikasi berhasil disetup di ${verifyChannel}!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error setting up verification:', error);
            await interaction.reply({
                content: '❌ Terjadi error saat setup sistem verifikasi!',
                ephemeral: true
            });
        }
    },
};
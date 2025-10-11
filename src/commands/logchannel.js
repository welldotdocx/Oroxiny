const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logchannel')
        .setDescription('Manage action log channel settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Show current log channel information')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Send a test log message to verify logging works')
        ),
    
    async execute(interaction) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ Anda tidak memiliki permission untuk menggunakan command ini!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const logChannelId = '1423605806044326977'; // Same as in ActionLogger

        if (subcommand === 'info') {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            
            const embed = new EmbedBuilder()
                .setTitle('📊 Action Log Channel Info')
                .setColor(config.color)
                .setTimestamp()
                .setFooter({ text: config.embedFooter });

            if (logChannel) {
                embed.setDescription(`Action logging is configured and active.`)
                    .addFields(
                        { name: 'Log Channel', value: `${logChannel} (${logChannel.name})`, inline: true },
                        { name: 'Channel ID', value: logChannelId, inline: true },
                        { name: 'Status', value: '✅ Active', inline: true }
                    );
            } else {
                embed.setDescription(`❌ Log channel not found!`)
                    .addFields(
                        { name: 'Expected Channel ID', value: logChannelId, inline: true },
                        { name: 'Status', value: '❌ Inactive', inline: true },
                        { name: 'Solution', value: 'Make sure the log channel exists and the bot has access', inline: false }
                    );
            }

            embed.addFields({
                name: 'Logged Events',
                value: '• Member Join/Leave\n• Role Changes\n• Channel Create/Delete/Update\n• Message Deletions\n• Member Bans/Unbans\n• Nickname Changes',
                inline: false
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } else if (subcommand === 'test') {
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            
            if (!logChannel) {
                return interaction.reply({
                    content: `❌ Log channel dengan ID \`${logChannelId}\` tidak ditemukan!`,
                    ephemeral: true
                });
            }

            // Send test log message
            const testEmbed = new EmbedBuilder()
                .setAuthor({
                    name: 'Test Log Message',
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setDescription(`This is a test message to verify action logging is working properly.`)
                .addFields(
                    { name: 'Triggered By', value: `${interaction.user}`, inline: true },
                    { name: 'Test Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: 'Status', value: '✅ Logging System Active', inline: true }
                )
                .setColor('#00ff00')
                .setFooter({ text: `ID: ${interaction.user.id} • ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US')}` })
                .setTimestamp();

            try {
                await logChannel.send({ embeds: [testEmbed] });
                
                await interaction.reply({
                    content: `✅ Test log message berhasil dikirim ke ${logChannel}!`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Error sending test log:', error);
                
                await interaction.reply({
                    content: `❌ Gagal mengirim test log ke ${logChannel}. Periksa permissions bot!`,
                    ephemeral: true
                });
            }
        }
    },
};
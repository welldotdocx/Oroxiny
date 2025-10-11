const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Cek latency bot'),
    
    async execute(interaction) {
        const ping = interaction.client.ws.ping;
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription(`**Latency:** ${ping}ms`)
            .setColor(config.color)
            .setTimestamp()
            .setFooter({ text: config.embedFooter });
        
        await interaction.reply({ embeds: [embed] });
    },
};
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Bot akan mengulangi pesan yang Anda ketik')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Pesan yang ingin diulang')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const message = interaction.options.getString('message');
        await interaction.reply(message);
    },
};
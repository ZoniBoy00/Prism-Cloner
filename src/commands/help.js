/**
 * @file help.js
 * @description /help — displays a premium usage guide embed.
 */

const { MessageEmbed } = require('discord.js');
const { NAME, COLORS } = require('../config');

module.exports = {
    data: {
        name: 'help',
        description: `How to use ${NAME}`
    },

    async execute(interaction) {
        const embed = new MessageEmbed()
            .setTitle(`💎 ${NAME}`)
            .setColor(COLORS.PRISM)
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `The most advanced Discord server\nmigration tool.\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            .addFields(
                {
                    name: '🚀 Quick Start',
                    value: [
                        '```',
                        '1. Invite bot → Admin perms',
                        '2. Move bot role → TOP',
                        '3. /clone source_id target_id',
                        '```'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📂 Cleanup Options',
                    value: '> 🗑️ Wipe Channels\n> 🗑️ Wipe Roles\n> 🗑️ Wipe Emojis',
                    inline: true
                },
                {
                    name: '📦 Clone Options',
                    value: '> 📂 Clone Channels\n> 👑 Clone Roles\n> ✨ Clone Emojis',
                    inline: true
                },
                {
                    name: '🛡️ Permissions',
                    value: 'Bot needs **Administrator** and its role must be **above all other roles** to manage them.',
                    inline: false
                },
                {
                    name: '📊 Live Progress',
                    value: 'After launching, you\'ll receive a **DM** with a real-time progress bar, ETA, and phase checklist.',
                    inline: false
                },
                {
                    name: '⚠️ Disclaimer',
                    value: '> Selfbots violate Discord ToS.\n> Use at your own risk.',
                    inline: false
                }
            )
            .setFooter({ text: `${NAME} ┃ /clone to get started` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

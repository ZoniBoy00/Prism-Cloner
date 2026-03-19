/**
 * @file status.js
 * @description /status — shows bot info, uptime, server count, and ping.
 */

const { MessageEmbed } = require('discord.js');
const { NAME, COLORS } = require('../config');

module.exports = {
    data: {
        name: 'status',
        description: `View ${NAME} system status`
    },

    async execute(interaction) {
        const { client } = interaction;
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const secs = Math.floor(uptime % 60);

        const mem = process.memoryUsage();
        const memMB = (mem.heapUsed / 1024 / 1024).toFixed(1);

        const embed = new MessageEmbed()
            .setTitle(`💎 ${NAME} — Status`)
            .setColor(COLORS.PRISM)
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `System overview and diagnostics.\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            .addFields(
                { name: '🤖 Bot', value: `\`${client.user.tag}\``, inline: true },
                { name: '🏠 Servers', value: `\`${client.guilds.cache.size}\``, inline: true },
                { name: '📡 Ping', value: `\`${client.ws.ping}ms\``, inline: true },
                { name: '⏱ Uptime', value: `\`${hours}h ${mins}m ${secs}s\``, inline: true },
                { name: '💾 Memory', value: `\`${memMB} MB\``, inline: true },
                { name: '📦 Node.js', value: `\`${process.version}\``, inline: true }
            )
            .setFooter({ text: `${NAME} ┃ v2.0.0` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

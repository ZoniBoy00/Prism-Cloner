/**
 * @file clone.js
 * @description /clone — interactive server migration setup with toggle buttons.
 */

const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const { NAME, ALLOWED_ID, COLORS } = require('../config');
const { startCloningProcess } = require('../cloner');
const { userClient } = require('../client');
const { delay } = require('../utils/helpers');

/** Button definitions for cleaner code */
const BUTTONS = {
    1: { emoji: '🗑️', label: 'Channels', group: 'Cleanup' },
    2: { emoji: '🗑️', label: 'Roles',    group: 'Cleanup' },
    3: { emoji: '🗑️', label: 'Emojis',   group: 'Cleanup' },
    4: { emoji: '📂', label: 'Channels', group: 'Clone' },
    5: { emoji: '👑', label: 'Roles',    group: 'Clone' },
    6: { emoji: '✨', label: 'Emojis',   group: 'Clone' }
};

module.exports = {
    data: {
        name: 'clone',
        description: 'Migrate a server — roles, channels, emojis',
        options: [
            { name: 'source_id', description: 'Server ID to clone FROM', type: 3, required: true },
            { name: 'target_id', description: 'Server ID to clone INTO', type: 3, required: true }
        ],
        default_member_permissions: '8'
    },

    async execute(interaction) {
        // ── Auth ──
        if (interaction.user.id !== ALLOWED_ID) {
            return interaction.reply({ content: '🔒 Access denied.', ephemeral: true });
        }

        const sourceId = interaction.options.getString('source_id');
        const targetId = interaction.options.getString('target_id');

        if (sourceId === targetId) {
            return interaction.reply({ content: '❌ Source and target cannot be the same server.', ephemeral: true });
        }

        // ── Validate guilds ──
        const sourceGuild = userClient.guilds.cache.get(sourceId);
        if (!sourceGuild) {
            return interaction.reply({ content: '❌ Cannot access source server via user account.', ephemeral: true });
        }

        const targetGuild = interaction.client.guilds.cache.get(targetId);
        if (!targetGuild) {
            return interaction.reply({ content: '❌ Bot is not in the target server.', ephemeral: true });
        }

        const me = await targetGuild.members.fetch(interaction.client.user.id);
        if (!me.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: '❌ Bot needs **Administrator** permission in the target server.', ephemeral: true });
        }

        const topPos = Math.max(...targetGuild.roles.cache.map(r => r.position));
        if (me.roles.highest.position < topPos) {
            return interaction.reply({ content: '❌ Bot role must be at the **very top** of the hierarchy.', ephemeral: true });
        }

        // ── Options state ──
        const opts = { 1: false, 2: false, 3: false, 4: true, 5: true, 6: true };

        const buildEmbed = () => {
            const cleanupLines = [1, 2, 3].map(i =>
                `${opts[i] ? '✅' : '❌'} ${BUTTONS[i].emoji} ${BUTTONS[i].label}`
            ).join('\n');

            const cloneLines = [4, 5, 6].map(i =>
                `${opts[i] ? '✅' : '❌'} ${BUTTONS[i].emoji} ${BUTTONS[i].label}`
            ).join('\n');

            return new MessageEmbed()
                .setTitle('💎 Migration Setup')
                .setColor(COLORS.PRISM)
                .setDescription(
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `📤 **Source:** ${sourceGuild.name}\n` +
                    `📥 **Target:** ${targetGuild.name}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `Toggle the options below, then hit **Launch**.\n` +
                    `Cleanup runs first, then cloning begins.`)
                .addFields(
                    { name: '🗑️ Cleanup Phase', value: cleanupLines, inline: true },
                    { name: '📦 Clone Phase', value: cloneLines, inline: true },
                    { name: '⚙️ Auto-included', value: '> Server name, icon, banner,\n> verification & notification settings', inline: false }
                )
                .setFooter({ text: `${NAME} ┃ Requested by ${interaction.user.tag}` })
                .setTimestamp();
        };

        const buildButtons = () => {
            const row1 = new MessageActionRow();
            for (let i = 1; i <= 3; i++) {
                row1.addComponents(
                    new MessageButton()
                        .setCustomId(`opt_${i}`)
                        .setEmoji(BUTTONS[i].emoji)
                        .setLabel(`${BUTTONS[i].group} ${BUTTONS[i].label}`)
                        .setStyle(opts[i] ? 'SUCCESS' : 'SECONDARY')
                );
            }

            const row2 = new MessageActionRow();
            for (let i = 4; i <= 6; i++) {
                row2.addComponents(
                    new MessageButton()
                        .setCustomId(`opt_${i}`)
                        .setEmoji(BUTTONS[i].emoji)
                        .setLabel(`${BUTTONS[i].group} ${BUTTONS[i].label}`)
                        .setStyle(opts[i] ? 'SUCCESS' : 'SECONDARY')
                );
            }

            const row3 = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('start_clone')
                    .setEmoji('🚀')
                    .setLabel('Launch Migration')
                    .setStyle('PRIMARY')
            );

            return [row1, row2, row3];
        };

        // ── Send setup message ──
        const response = await interaction.reply({
            embeds: [buildEmbed()],
            components: buildButtons(),
            fetchReply: true
        });

        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 600_000
        });

        collector.on('collect', async i => {
            if (i.customId.startsWith('opt_')) {
                const n = parseInt(i.customId.split('_')[1]);
                opts[n] = !opts[n];
                await i.update({ embeds: [buildEmbed()], components: buildButtons() });
            } else if (i.customId === 'start_clone') {
                collector.stop('started');

                const launchEmbed = new MessageEmbed()
                    .setTitle('🚀 Migration Launching...')
                    .setColor(COLORS.PRISM)
                    .setDescription(
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `📤 **${sourceGuild.name}** → 📥 **${targetGuild.name}**\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `Preparing migration... check your **DMs** for live progress!`)
                    .setFooter({ text: NAME })
                    .setTimestamp();

                await i.update({ embeds: [launchEmbed], components: [] });
                await delay(1500);
                startCloningProcess(interaction, sourceGuild, targetGuild, opts);
            }
        });

        collector.on('end', (_, reason) => {
            if (reason !== 'started') {
                const expiredEmbed = new MessageEmbed()
                    .setTitle('⏰ Session Expired')
                    .setColor(COLORS.DANGER)
                    .setDescription('The migration setup timed out. Run `/clone` again to start over.')
                    .setTimestamp();

                interaction.editReply({ embeds: [expiredEmbed], components: [] }).catch(() => {});
            }
        });
    }
};

/**
 * @file index.js (cloner)
 * @description Orchestrates the full migration process.
 */

const { deleteChannels, deleteRoles, deleteEmojis } = require('./delete');
const { cloneSettings } = require('./cloneSettings');
const { cloneRoles } = require('./cloneRoles');
const { cloneChannels } = require('./cloneChannels');
const { cloneEmojis } = require('./cloneEmojis');
const Logger = require('../utils/logger');
const ProgressTracker = require('./progress');

/**
 * Run the migration pipeline based on user-selected options.
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {import('discord.js').Guild} source Source guild (via selfbot).
 * @param {import('discord.js').Guild} target Target guild (via bot).
 * @param {Object} opts Option flags { 1..6: boolean }.
 */
async function startCloningProcess(interaction, source, target, opts) {
    const t0 = Date.now();

    // Determine active phases in execution order
    const phases = [];
    if (opts[1]) phases.push('🗑️ Wipe Channels');
    if (opts[2]) phases.push('🗑️ Wipe Roles');
    if (opts[3]) phases.push('🗑️ Wipe Emojis');
    phases.push('⚙️ Clone Settings'); // Always clone settings
    if (opts[5]) phases.push('👑 Clone Roles');
    if (opts[4]) phases.push('📂 Clone Channels');
    if (opts[6]) phases.push('✨ Clone Emojis');

    const tracker = new ProgressTracker(interaction.user, source.name, target.name);
    tracker.setPhases(phases);

    Logger.info(`Migration: ${source.name} → ${target.name}`);
    Logger.info(`Phases: ${phases.join(' | ')}`);

    const phaseTimings = [];

    // ── Cleanup ──
    if (opts[1]) {
        const s = Date.now();
        await deleteChannels(target, interaction.channelId, tracker);
        phaseTimings.push({ name: 'Wipe Channels', time: Date.now() - s });
    }
    if (opts[2]) {
        const s = Date.now();
        await deleteRoles(target, tracker);
        phaseTimings.push({ name: 'Wipe Roles', time: Date.now() - s });
    }
    if (opts[3]) {
        const s = Date.now();
        await deleteEmojis(target, tracker);
        phaseTimings.push({ name: 'Wipe Emojis', time: Date.now() - s });
    }

    // ── Settings (always) ──
    {
        const s = Date.now();
        await cloneSettings(source, target, tracker);
        phaseTimings.push({ name: 'Clone Settings', time: Date.now() - s });
    }

    // ── Clone ──
    const roleMap = new Map();
    if (opts[5]) {
        const s = Date.now();
        await cloneRoles(source, target, roleMap, tracker);
        phaseTimings.push({ name: 'Clone Roles', time: Date.now() - s });
    }
    if (opts[4]) {
        const s = Date.now();
        await cloneChannels(source, target, roleMap, tracker);
        phaseTimings.push({ name: 'Clone Channels', time: Date.now() - s });
    }
    if (opts[6]) {
        const s = Date.now();
        await cloneEmojis(source, target, tracker);
        phaseTimings.push({ name: 'Clone Emojis', time: Date.now() - s });
    }

    // ── Complete ──
    const elapsed = Date.now() - t0;
    await tracker.sendCompletionEmbed(elapsed);

    // Print summary table to console
    console.log('');
    Logger.success('━━━━━━━━ Migration Summary ━━━━━━━━');
    Logger.info(`Source:    ${source.name}`);
    Logger.info(`Target:    ${target.name}`);
    console.log('');
    for (const pt of phaseTimings) {
        const sec = (pt.time / 1000).toFixed(1);
        Logger.info(`  ${pt.name.padEnd(18)} ${sec}s`);
    }
    console.log('');
    Logger.info(`  Processed:       ${tracker.totalProcessed}`);
    Logger.info(`  Failed:          ${tracker.totalFailed}`);
    Logger.success(`  Total time:      ${Math.floor(elapsed / 60000)}m ${Math.floor((elapsed / 1000) % 60)}s`);
    Logger.success('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
}

module.exports = { startCloningProcess };

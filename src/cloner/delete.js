/**
 * @file delete.js
 * @description Deletes channels, roles, and emojis from a target guild.
 */

const { delay } = require('../utils/helpers');
const { API_DELAY } = require('../config');
const Logger = require('../utils/logger');

/**
 * Delete all channels (except the log channel).
 * @param {import('discord.js').Guild} guild Target guild.
 * @param {string} preserveId Channel ID to keep (for logging).
 * @param {import('./progress')} tracker Progress tracker.
 */
async function deleteChannels(guild, preserveId, tracker) {
    const channels = [...guild.channels.cache.filter(ch => ch.deletable).values()];
    tracker.startPhase('🗑️ Wipe Channels', channels.length);

    for (const ch of channels) {
        if (ch.id === preserveId) { await tracker.itemDone('Skipped log channel'); continue; }
        try {
            await ch.delete();
            await tracker.itemDone(`Deleted: ${ch.name}`);
        } catch (e) {
            Logger.warn(`Channel ${ch.name}: ${e.message}`);
            await tracker.itemFailed(`Channel: ${ch.name}`);
        }
        await delay(API_DELAY);
    }
    await tracker.forceUpdate();
}

/**
 * Delete all editable, non-managed roles.
 * @param {import('discord.js').Guild} guild Target guild.
 * @param {import('./progress')} tracker Progress tracker.
 */
async function deleteRoles(guild, tracker) {
    const roles = [...guild.roles.cache.filter(r => r.name !== '@everyone' && !r.managed && r.editable).values()];
    tracker.startPhase('🗑️ Wipe Roles', roles.length);

    for (const role of roles) {
        try {
            await role.delete();
            await tracker.itemDone(`Deleted: ${role.name}`);
        } catch (e) {
            Logger.warn(`Role ${role.name}: ${e.message}`);
            await tracker.itemFailed(`Role: ${role.name}`);
        }
        await delay(API_DELAY);
    }
    await tracker.forceUpdate();
}

/**
 * Delete all deletable emojis.
 * @param {import('discord.js').Guild} guild Target guild.
 * @param {import('./progress')} tracker Progress tracker.
 */
async function deleteEmojis(guild, tracker) {
    const emojis = [...guild.emojis.cache.filter(e => e.deletable).values()];
    tracker.startPhase('🗑️ Wipe Emojis', emojis.length);

    for (const emoji of emojis) {
        try {
            await emoji.delete();
            await tracker.itemDone(`Deleted: ${emoji.name}`);
        } catch (e) {
            Logger.warn(`Emoji ${emoji.name}: ${e.message}`);
            await tracker.itemFailed(`Emoji: ${emoji.name}`);
        }
        await delay(API_DELAY);
    }
    await tracker.forceUpdate();
}

module.exports = { deleteChannels, deleteRoles, deleteEmojis };

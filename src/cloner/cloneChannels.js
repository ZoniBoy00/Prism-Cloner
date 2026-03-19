/**
 * @file cloneChannels.js
 * @description Clones categories, text channels, and voice channels.
 */

const { delay, retry } = require('../utils/helpers');
const { API_DELAY } = require('../config');
const { mapOverwrites } = require('./cloneRoles');
const Logger = require('../utils/logger');

/** Channel type constants for Discord.js v13 */
const TYPE = { CATEGORY: 'GUILD_CATEGORY', TEXT: 'GUILD_TEXT', VOICE: 'GUILD_VOICE' };

/** Type 5 (GUILD_NEWS) is not valid for channel.create in v13 — fallback to text. */
const isTextLike = (t) => [TYPE.TEXT, 0, 'GUILD_NEWS', 5].includes(t);

/**
 * Clone all channels from source to target guild.
 * Uses retry() on each channel for resilience.
 * @param {import('discord.js').Guild} source Source guild.
 * @param {import('discord.js').Guild} target Target guild.
 * @param {Map<string,string>} roleMap Role mapping for permission overwrites.
 * @param {import('./progress')} tracker Progress tracker.
 */
async function cloneChannels(source, target, roleMap, tracker) {
    const catMap = new Map();
    const channels = [...source.channels.cache.values()];

    const cats   = channels.filter(c => [TYPE.CATEGORY, 4].includes(c.type)).sort((a, b) => a.position - b.position);
    const texts  = channels.filter(c => isTextLike(c.type)).sort((a, b) => a.position - b.position);
    const voices = channels.filter(c => [TYPE.VOICE, 2].includes(c.type)).sort((a, b) => a.position - b.position);

    tracker.startPhase('📂 Clone Channels', cats.length + texts.length + voices.length);

    // ── Categories ──
    for (const cat of cats) {
        try {
            const created = await retry(() => target.channels.create(cat.name, {
                type: TYPE.CATEGORY,
                position: cat.position,
                permissionOverwrites: mapOverwrites(cat.permissionOverwrites.cache, roleMap)
            }));
            catMap.set(cat.id, created.id);
            await tracker.itemDone(`Category: ${cat.name}`);
        } catch (e) {
            Logger.error(`Category ${cat.name}: ${e.message}`);
            await tracker.itemFailed(`Category: ${cat.name}`);
        }
        await delay(API_DELAY);
    }

    // ── Text Channels ──
    for (const ch of texts) {
        try {
            await retry(() => target.channels.create(ch.name, {
                type: TYPE.TEXT,
                parent: ch.parentId ? catMap.get(ch.parentId) : null,
                topic: ch.topic || '',
                nsfw: ch.nsfw || false,
                position: ch.position,
                permissionOverwrites: mapOverwrites(ch.permissionOverwrites.cache, roleMap)
            }));
            await tracker.itemDone(`Text: ${ch.name}`);
        } catch (e) {
            Logger.error(`Text ${ch.name}: ${e.message}`);
            await tracker.itemFailed(`Text: ${ch.name}`);
        }
        await delay(API_DELAY);
    }

    // ── Voice Channels ──
    for (const ch of voices) {
        try {
            await retry(() => target.channels.create(ch.name, {
                type: TYPE.VOICE,
                parent: ch.parentId ? catMap.get(ch.parentId) : null,
                bitrate: Math.min(ch.bitrate || 64000, target.maximumBitrate || 96000),
                userLimit: ch.userLimit || 0,
                position: ch.position,
                permissionOverwrites: mapOverwrites(ch.permissionOverwrites.cache, roleMap)
            }));
            await tracker.itemDone(`Voice: ${ch.name}`);
        } catch (e) {
            Logger.error(`Voice ${ch.name}: ${e.message}`);
            await tracker.itemFailed(`Voice: ${ch.name}`);
        }
        await delay(API_DELAY);
    }

    await tracker.forceUpdate();
}

module.exports = { cloneChannels };

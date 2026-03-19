/**
 * @file cloneEmojis.js
 * @description Clones static & animated emojis with rate-limit protection.
 */

const { delay } = require('../utils/helpers');
const { API_DELAY } = require('../config');
const Logger = require('../utils/logger');

/** Max emoji slots per boost tier. */
const TIER_LIMITS = { NONE: 50, TIER_1: 100, TIER_2: 150, TIER_3: 250 };

/**
 * Clone emojis from source to target guild.
 * @param {import('discord.js').Guild} source Source guild.
 * @param {import('discord.js').Guild} target Target guild.
 * @param {import('./progress')} tracker Progress tracker.
 */
async function cloneEmojis(source, target, tracker) {
    const maxEmojis = TIER_LIMITS[target.premiumTier] || TIER_LIMITS.NONE;

    const staticSlots   = Math.max(0, maxEmojis - target.emojis.cache.filter(e => !e.animated).size);
    const animatedSlots = Math.max(0, maxEmojis - target.emojis.cache.filter(e =>  e.animated).size);

    const toClone = [
        ...[...source.emojis.cache.filter(e => !e.animated).values()].slice(0, staticSlots),
        ...[...source.emojis.cache.filter(e =>  e.animated).values()].slice(0, animatedSlots)
    ];

    tracker.startPhase('✨ Clone Emojis', toClone.length);
    if (!toClone.length) { await tracker.forceUpdate(); return; }

    for (const emoji of toClone) {
        try {
            await Promise.race([
                target.emojis.create(emoji.url, emoji.name),
                new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), 15000))
            ]);
            await tracker.itemDone(`Emoji: ${emoji.name}`);
        } catch (e) {
            if (e.message === 'TIMEOUT' || e.code === 429) {
                Logger.warn(`Rate limited at emoji: ${emoji.name}`);
                await tracker.itemFailed('Rate limited — stopping emojis');
                break;
            }
            if (e.code === 30014 || String(e).includes('Maximum number of emojis')) {
                Logger.warn(`Max emoji slots reached at: ${emoji.name}`);
                await tracker.itemFailed('Max slots reached — stopping');
                break;
            }
            Logger.error(`Emoji ${emoji.name}: ${e.message}`);
            await tracker.itemFailed(`Emoji: ${emoji.name}`);
        }
        await delay(API_DELAY);
    }
    await tracker.forceUpdate();
}

module.exports = { cloneEmojis };

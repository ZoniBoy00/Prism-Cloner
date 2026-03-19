/**
 * @file cloneRoles.js
 * @description Clones roles and provides a permission-overwrite mapper.
 */

const { delay, retry } = require('../utils/helpers');
const { API_DELAY } = require('../config');
const Logger = require('../utils/logger');

/**
 * Clone all non-managed roles from source to target guild.
 * Uses retry() on each role to handle transient API errors.
 * @param {import('discord.js').Guild} source Source guild.
 * @param {import('discord.js').Guild} target Target guild.
 * @param {Map<string,string>} roleMap Filled with sourceId → targetId mappings.
 * @param {import('./progress')} tracker Progress tracker.
 */
async function cloneRoles(source, target, roleMap, tracker) {
    roleMap.set(source.roles.everyone.id, target.roles.everyone.id);

    const roles = [...source.roles.cache.values()]
        .filter(r => r.name !== '@everyone' && !r.managed)
        .sort((a, b) => b.position - a.position);

    tracker.startPhase('👑 Clone Roles', roles.length);

    for (const role of roles) {
        try {
            const created = await retry(() => target.roles.create({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                permissions: role.permissions.bitfield.toString(),
                mentionable: role.mentionable,
                reason: 'Prism Cloner'
            }));
            roleMap.set(role.id, created.id);
            await tracker.itemDone(`Role: ${role.name}`);
        } catch (e) {
            Logger.error(`Role ${role.name}: ${e.message}`);
            await tracker.itemFailed(`Role: ${role.name}`);
        }
        await delay(API_DELAY);
    }
    await tracker.forceUpdate();
}

/**
 * Translates source permission overwrites to target role IDs.
 * @param {import('discord.js').Collection} overwrites Source overwrites collection.
 * @param {Map<string,string>} roleMap Source→Target role ID map.
 * @returns {Array} Overwrite array for channel creation.
 */
function mapOverwrites(overwrites, roleMap) {
    const mapped = [];
    for (const ow of overwrites.values()) {
        if (ow.type !== 'role') continue;
        const targetId = roleMap.get(ow.id);
        if (targetId) {
            mapped.push({
                id: targetId,
                allow: ow.allow.bitfield.toString(),
                deny: ow.deny.bitfield.toString()
            });
        }
    }
    return mapped;
}

module.exports = { cloneRoles, mapOverwrites };

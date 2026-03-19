/**
 * @file cloneSettings.js
 * @description Clones server settings: name, icon, banner, splash, verification, etc.
 */

const Logger = require('../utils/logger');

/**
 * Clone guild-level settings from source to target.
 * @param {import('discord.js').Guild} source Source guild.
 * @param {import('discord.js').Guild} target Target guild.
 * @param {import('./progress')} tracker Progress tracker.
 */
async function cloneSettings(source, target, tracker) {
    const settings = [];

    // Collect what we can clone
    settings.push({ name: 'Server Name', fn: () => target.setName(source.name) });
    settings.push({ name: 'Verification Level', fn: () => target.setVerificationLevel(source.verificationLevel) });
    settings.push({ name: 'Default Notifications', fn: () => target.setDefaultMessageNotifications(source.defaultMessageNotifications) });
    settings.push({ name: 'Explicit Content Filter', fn: () => target.setExplicitContentFilter(source.explicitContentFilter) });
    settings.push({ name: 'AFK Timeout', fn: () => target.setAFKTimeout(source.afkTimeout) });

    if (source.iconURL()) {
        settings.push({ name: 'Server Icon', fn: () => target.setIcon(source.iconURL({ dynamic: true, size: 1024 })) });
    }
    if (source.bannerURL()) {
        settings.push({ name: 'Server Banner', fn: () => target.setBanner(source.bannerURL({ size: 1024 })) });
    }
    if (source.splashURL()) {
        settings.push({ name: 'Invite Splash', fn: () => target.setSplash(source.splashURL({ size: 1024 })) });
    }

    tracker.startPhase('⚙️ Clone Settings', settings.length);

    for (const setting of settings) {
        try {
            await setting.fn();
            await tracker.itemDone(setting.name);
        } catch (e) {
            Logger.warn(`Setting ${setting.name}: ${e.message}`);
            await tracker.itemFailed(setting.name);
        }
    }

    await tracker.forceUpdate();
}

module.exports = { cloneSettings };

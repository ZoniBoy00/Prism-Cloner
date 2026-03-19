/**
 * @file ready.js
 * @description Fired once when the bot is online. Registers slash commands globally.
 */

const { showLogo } = require('../utils/helpers');
const Logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    async execute(bot) {
        showLogo();
        Logger.bot(`Logged in as ${bot.user.tag}`);

        const commands = Array.from(bot.commands.values()).map(c => c.data);

        try {
            Logger.bot(`Registering ${commands.length} slash command(s)...`);
            await bot.application.commands.set(commands);
            Logger.success(`Slash commands registered successfully.`);
        } catch (err) {
            Logger.error('Slash command registration failed', err);
        }
    },
};

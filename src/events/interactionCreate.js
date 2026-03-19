/**
 * @file interactionCreate.js
 * @description Routes incoming slash-command interactions to the correct handler.
 */

const Logger = require('../utils/logger');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            Logger.warn(`Unknown command received: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (err) {
            Logger.error(`Command /${interaction.commandName} failed`, err);
            const payload = { content: '❌ An error occurred while running this command.', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(payload).catch(() => {});
            } else {
                await interaction.reply(payload).catch(() => {});
            }
        }
    },
};

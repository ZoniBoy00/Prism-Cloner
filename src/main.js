/**
 * @file main.js
 * @description Application entry point — loads commands, events, then authenticates.
 */

const fs = require('node:fs');
const path = require('node:path');
const { bot, userClient, login } = require('./client');
const Logger = require('./utils/logger');

// ── Load Commands ──
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        bot.commands.set(command.data.name, command);
    } else {
        Logger.warn(`Command "${file}" is missing "data" or "execute" — skipped.`);
    }
}

// ── Load Events ──
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
    const event = require(path.join(eventsPath, file));
    bot[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));
}

// ── User Client Ready ──
userClient.once('ready', () => {
    Logger.userClient(`Logged in as ${userClient.user.tag}`);
});

// ── Graceful Shutdown ──
const shutdown = (signal) => {
    Logger.info(`${signal} received — shutting down gracefully...`);
    bot.destroy();
    userClient.destroy();
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => {
    Logger.error('Unhandled promise rejection', err);
});

// ── Start ──
login();

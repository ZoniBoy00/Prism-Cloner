/**
 * @file client.js
 * @description Initialises the Discord Bot client and Selfbot user client.
 */

const { Client: BotClient, Intents, Collection } = require('discord.js');
const { Client: UserClient } = require('discord.js-selfbot-v13');
const { BOT_TOKEN, DC_TOKEN } = require('./config');
const Logger = require('./utils/logger');

const bot = new BotClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

bot.commands = new Collection();

const userClient = new UserClient({ checkUpdate: false });

module.exports = {
    bot,
    userClient,

    /** Authenticate both clients. Exits on failure. */
    login: async () => {
        try {
            await Promise.all([
                bot.login(BOT_TOKEN),
                userClient.login(DC_TOKEN)
            ]);
        } catch (err) {
            Logger.error('Login failed', err);
            process.exit(1);
        }
    }
};

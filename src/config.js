/**
 * @file config.js
 * @description Central configuration for Prism Cloner.
 * Loads environment variables and defines app-wide constants.
 */

require('dotenv').config();

module.exports = {
    /** Application display name */
    NAME: 'Prism Cloner',

    /** Discord Bot Token (from .env) */
    BOT_TOKEN: process.env.BOT_TOKEN,

    /** Discord User/Selfbot Token (from .env) */
    DC_TOKEN: process.env.DC_TOKEN,

    /** Only this user ID can execute commands */
    ALLOWED_ID: process.env.ALLOWED_ID,

    /** Delay between API calls in ms (lower = faster, but higher rate-limit risk) */
    API_DELAY: 800,

    /** Color palette used across embeds and console */
    COLORS: {
        PRISM: '#00d4ff',
        SUCCESS: '#00ff88',
        DANGER: '#ff4b4b',
        CONSOLE_PRISM: '\x1b[36m',
        CONSOLE_RESET: '\x1b[0m'
    }
};

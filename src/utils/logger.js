/**
 * @file logger.js
 * @description Standardised console logger with color-coded levels.
 */

const { COLORS } = require('../config');

const LEVEL = {
    INFO:    `${COLORS.CONSOLE_PRISM}[INFO]${COLORS.CONSOLE_RESET}`,
    SUCCESS: `\x1b[32m[SUCCESS]\x1b[0m`,
    WARN:    `\x1b[33m[WARN]\x1b[0m`,
    ERROR:   `\x1b[31m[ERROR]\x1b[0m`,
    BOT:     `${COLORS.CONSOLE_PRISM}[BOT]${COLORS.CONSOLE_RESET}`,
    USER:    `${COLORS.CONSOLE_PRISM}[USER]${COLORS.CONSOLE_RESET}`
};

class Logger {
    static info(msg)            { console.log(`${LEVEL.INFO} ${msg}`); }
    static success(msg)         { console.log(`${LEVEL.SUCCESS} ${msg}`); }
    static warn(msg)            { console.log(`${LEVEL.WARN} ${msg}`); }
    static error(msg, err)      { console.error(`${LEVEL.ERROR} ${msg}`); if (err) console.error(err); }
    static bot(msg)             { console.log(`${LEVEL.BOT} ${msg}`); }
    static userClient(msg)      { console.log(`${LEVEL.USER} ${msg}`); }
}

module.exports = Logger;

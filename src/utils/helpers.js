/**
 * @file helpers.js
 * @description Shared utility functions.
 */

const { COLORS } = require('../config');

/** Returns a promise that resolves after `ms` milliseconds. */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** Clears the console and prints the Prism startup banner. */
const showLogo = () => {
    console.clear();
    console.log(COLORS.CONSOLE_PRISM + `
  ██████╗ ██████╗ ██╗███████╗███╗   ███╗
  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║
  ██████╔╝██████╔╝██║███████╗██╔████╔██║
  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║
  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║
  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝
` + COLORS.CONSOLE_RESET);
};

/**
 * Retry an async function up to `retries` times with delay between attempts.
 * @param {Function} fn Async function to attempt.
 * @param {number} retries Max retries (default 2).
 * @param {number} retryDelay Delay between retries in ms (default 2000).
 * @returns {Promise<*>} Result of fn().
 */
const retry = async (fn, retries = 2, retryDelay = 2000) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === retries) throw err;
            await delay(retryDelay);
        }
    }
};

module.exports = { delay, showLogo, retry };

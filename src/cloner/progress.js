/**
 * @file progress.js
 * @description Real-time progress tracker via a single, self-updating DM embed.
 */

const { MessageEmbed } = require('discord.js');
const { NAME, COLORS } = require('../config');
const Logger = require('../utils/logger');

class ProgressTracker {
    /**
     * @param {import('discord.js').User} user The user to DM.
     * @param {string} sourceName Source guild name.
     * @param {string} targetName Target guild name.
     */
    constructor(user, sourceName, targetName) {
        this.user = user;
        this.sourceName = sourceName;
        this.targetName = targetName;

        this.message = null;
        this.startTime = Date.now();
        this.lastUpdate = 0;
        this.updateCooldown = 3000;

        this.phases = [];
        this.phaseIndex = 0;
        this.currentPhase = '';
        this.total = 0;
        this.done = 0;
        this.failed = 0;
        this.totalFailed = 0;
        this.totalProcessed = 0;
        this.logs = [];
    }

    /** Register the ordered list of phases. */
    setPhases(phases) { this.phases = phases; }

    /**
     * Begin a new phase.
     * @param {string} name Phase display name.
     * @param {number} count Items to process in this phase.
     */
    startPhase(name, count) {
        this.currentPhase = name;
        this.phaseIndex = this.phases.indexOf(name);
        this.total = count;
        this.done = 0;
        this.failed = 0;
        Logger.info(`Phase: ${name} (${count} items)`);
    }

    /** Record a successful item. */
    async itemDone(label) {
        this.done++;
        this.totalProcessed++;
        this._log(`✅ ${label}`);
        await this._update();
    }

    /** Record a failed item. */
    async itemFailed(label) {
        this.done++;
        this.failed++;
        this.totalFailed++;
        this.totalProcessed++;
        this._log(`⚠️ ${label}`);
        await this._update();
    }

    /** Force an immediate embed update (e.g. at phase end). */
    async forceUpdate() { await this._update(true); }

    // ────────────────────── Private ──────────────────────

    _log(text) {
        this.logs.push(text);
        if (this.logs.length > 6) this.logs.shift();
    }

    async _update(force = false) {
        const now = Date.now();
        if (!force && now - this.lastUpdate < this.updateCooldown) return;
        this.lastUpdate = now;

        try {
            const embed = this._embed();
            if (!this.message) {
                this.message = await this.user.send({ embeds: [embed] });
            } else {
                await this.message.edit({ embeds: [embed] });
            }
        } catch (e) {
            Logger.warn(`DM update failed: ${e.message}`);
        }
    }

    _embed() {
        const elapsed = Date.now() - this.startTime;
        const pct = this.total > 0 ? Math.round((this.done / this.total) * 100) : 0;

        // Fancy progress bar with gradient feel
        const barLen = 16;
        const filled = Math.round(barLen * (pct / 100));
        const bar = '▓'.repeat(filled) + '░'.repeat(barLen - filled);

        // ETA calculation
        let eta = '`Calculating...`';
        if (this.done > 0 && pct < 100) {
            eta = `\`${this._fmt((elapsed / this.done) * (this.total - this.done))}\``;
        } else if (pct >= 100) {
            eta = '`Complete`';
        }

        // Phase checklist
        const phaseLines = this.phases.map((p, i) => {
            if (i < this.phaseIndex) return `> ✅ ~~${p}~~`;
            if (i === this.phaseIndex) return `> 🔄 **${p}** ← current`;
            return `> ⬜ ${p}`;
        }).join('\n');

        // Recent activity with code block
        const recentBlock = this.logs.length
            ? '```\n' + this.logs.map(l => l.replace(/[✅⚠️]/g, m => m === '✅' ? '+' : '!')).join('\n') + '\n```'
            : '```\nWaiting...\n```';

        const embed = new MessageEmbed()
            .setTitle('💎 Migration In Progress')
            .setColor(COLORS.PRISM)
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `📤 **Source:** ${this.sourceName}\n` +
                `📥 **Target:** ${this.targetName}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `**${this.currentPhase}**\n` +
                `\`[${bar}]\` **${pct}%**\n\n` +
                `⏱ Elapsed: \`${this._fmt(elapsed)}\` ┃ 🕐 ETA: ${eta}\n` +
                `📊 Progress: \`${this.done}/${this.total}\` ┃ ⚠️ Failed: \`${this.failed}\``)
            .addFields(
                { name: '📋 Phases', value: phaseLines || '—', inline: true },
                { name: '📜 Recent Activity', value: recentBlock, inline: false }
            )
            .setFooter({ text: `${NAME} ┃ Total processed: ${this.totalProcessed}` })
            .setTimestamp();

        return embed;
    }

    /**
     * Send the final "complete" embed (green, celebratory).
     * @param {number} totalMs Total elapsed time in ms.
     */
    async sendCompletionEmbed(totalMs) {
        const successCount = this.totalProcessed - this.totalFailed;

        const embed = new MessageEmbed()
            .setTitle('🎉 Migration Complete!')
            .setColor(COLORS.SUCCESS)
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `📤 **Source:** ${this.sourceName}\n` +
                `📥 **Target:** ${this.targetName}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                `\`[${'▓'.repeat(16)}]\` **100%**\n\n` +
                `Your server has been successfully migrated!`)
            .addFields(
                { name: '⏱ Duration', value: `\`${this._fmt(totalMs)}\``, inline: true },
                { name: '✅ Successful', value: `\`${successCount}\``, inline: true },
                { name: '⚠️ Failed', value: `\`${this.totalFailed}\``, inline: true }
            )
            .setFooter({ text: `${NAME} ┃ Thank you for using Prism` })
            .setTimestamp();

        try {
            this.message
                ? await this.message.edit({ embeds: [embed] })
                : await this.user.send({ embeds: [embed] });
        } catch (e) {
            Logger.warn(`Completion DM failed: ${e.message}`);
        }
    }

    _fmt(ms) {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    }
}

module.exports = ProgressTracker;

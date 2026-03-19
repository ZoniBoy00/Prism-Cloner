<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6b00ff,100:00d4ff&height=200&section=header&text=💎%20Prism%20Cloner&fontSize=50&fontColor=ffffff&fontAlignY=35&animation=fadeIn&desc=Modern%20Discord%20Server%20Migration%20Tool&descSize=18&descAlignY=55" alt="Prism Cloner" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/discord.js-v13-5865F2?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/node.js-%3E%3D16.11-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/version-2.0.0-00d4ff?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <b>One slash command · Real-time progress · Zero spam</b>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Preview](#-preview)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Usage](#️-usage)
- [Commands](#-commands)
- [Configuration](#-configuration)
- [GitHub Actions](#-github-actions)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#️-disclaimer)

---

## ✨ Features

<table>
<tr><td>🚀</td><td><b>Slash Commands</b></td><td>Interactive setup with <code>/clone</code>, <code>/help</code>, and <code>/status</code></td></tr>
<tr><td>📊</td><td><b>Live Progress</b></td><td>Single DM embed with animated progress bar, ETA & phase checklist</td></tr>
<tr><td>⚙️</td><td><b>Server Settings</b></td><td>Clones name, icon, banner, splash, verification & notification settings</td></tr>
<tr><td>🛡️</td><td><b>Roles</b></td><td>Permissions, colours, hoist — with full role-to-channel mapping</td></tr>
<tr><td>📂</td><td><b>Channels</b></td><td>Categories → Text → Voice, with permission overwrites preserved</td></tr>
<tr><td>😀</td><td><b>Emojis</b></td><td>Static & animated with boost-tier-aware slot limits</td></tr>
<tr><td>🔄</td><td><b>Auto-Retry</b></td><td>Failed API calls retry automatically (2 attempts) before marking failed</td></tr>
<tr><td>⚡</td><td><b>Configurable Speed</b></td><td>Tune <code>API_DELAY</code> to balance speed vs. rate-limit safety</td></tr>
<tr><td>🧹</td><td><b>Graceful Shutdown</b></td><td>Clean CTRL+C handling with proper client cleanup</td></tr>
<tr><td>📜</td><td><b>Console Summary</b></td><td>Per-phase timing breakdown printed after every migration</td></tr>
</table>

---

## 🖼️ Preview

<details>
<summary><b>📸 Console Output</b></summary>

```
  ██████╗ ██████╗ ██╗███████╗███╗   ███╗
  ██╔══██╗██╔══██╗██║██╔════╝████╗ ████║
  ██████╔╝██████╔╝██║███████╗██╔████╔██║
  ██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║
  ██║     ██║  ██║██║███████║██║ ╚═╝ ██║
  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝

[BOT] Logged in as MyBot#1234
[BOT] Registering 3 slash command(s)...
[SUCCESS] Slash commands registered successfully.
[USER] Logged in as myaccount

[INFO] Migration: Source Server → Target Server
[INFO] Phases: 🗑️ Wipe Channels | 👑 Clone Roles | 📂 Clone Channels

[SUCCESS] ━━━━━━━━ Migration Summary ━━━━━━━━
[INFO] Source:    Source Server
[INFO] Target:    Target Server
[INFO]   Wipe Channels      12.4s
[INFO]   Clone Settings     1.2s
[INFO]   Clone Roles        28.6s
[INFO]   Clone Channels     64.8s
[INFO]   Processed:         95
[INFO]   Failed:            0
[SUCCESS]   Total time:      1m 47s
[SUCCESS] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</details>

<details>
<summary><b>📸 Discord Setup Menu</b></summary>

```
💎 Migration Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 Source: My Server
📥 Target: New Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Toggle the options below, then hit Launch.

🗑️ Cleanup Phase     📦 Clone Phase
❌ 🗑️ Channels       ✅ 📂 Channels
❌ 🗑️ Roles          ✅ 👑 Roles
❌ 🗑️ Emojis         ✅ ✨ Emojis

⚙️ Auto-included:
Server name, icon, banner, verification & notification settings

                    [🚀 Launch Migration]
```

</details>

<details>
<summary><b>📸 DM Progress Tracker</b></summary>

```
💎 Migration In Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 Source: My Server
📥 Target: New Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase: 📂 Clone Channels
[▓▓▓▓▓▓▓▓▓▓░░░░░░] 62%

⏱ Elapsed: 2m 14s ┃ 🕐 ETA: 1m 22s
📊 31/50 done ┃ ⚠️ 0 failed

📋 Phases
> ✅ ~~⚙️ Clone Settings~~
> ✅ ~~👑 Clone Roles~~
> 🔄 **📂 Clone Channels** ← current
> ⬜ ✨ Clone Emojis
```

</details>

---

## 📁 Architecture

```
prism-cloner/
├── index.js                   # entry point
├── .env.example               # environment template
├── .gitignore
├── .github/workflows/         # GitHub Actions CI
│   └── prism.yml
└── src/
    ├── main.js                # loader + graceful shutdown
    ├── client.js              # bot + selfbot clients
    ├── config.js              # tokens, colours, API_DELAY
    │
    ├── commands/
    │   ├── clone.js           # /clone — interactive migration
    │   ├── help.js            # /help — usage guide
    │   └── status.js          # /status — bot diagnostics
    │
    ├── events/
    │   ├── ready.js           # slash command registration
    │   └── interactionCreate.js
    │
    ├── cloner/
    │   ├── index.js           # orchestrator + console summary
    │   ├── progress.js        # ProgressTracker (DM embed)
    │   ├── cloneSettings.js   # server name, icon, banner...
    │   ├── cloneRoles.js      # roles + permission mapper
    │   ├── cloneChannels.js   # categories / text / voice
    │   ├── cloneEmojis.js     # emojis + rate-limit guard
    │   └── delete.js          # wipe channels / roles / emojis
    │
    └── utils/
        ├── helpers.js         # delay(), showLogo(), retry()
        └── logger.js          # colour-coded console logger
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) `v16.11` or higher
- A [Discord Bot](https://discord.com/developers/applications) with **Administrator** permissions
- A Discord User Token (selfbot) for cross-server access

### Installation

```bash
# Clone the repository
git clone https://github.com/ZoniBoy00/prism-cloner.git
cd prism-cloner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see table below)

# Launch
npm start
```

### Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `BOT_TOKEN` | ✅ | Discord Bot token from the [Developer Portal](https://discord.com/developers) |
| `DC_TOKEN` | ✅ | Discord User token (selfbot) for source-server access |
| `ALLOWED_ID` | ✅ | Your Discord User ID — restricts `/clone` to you only |

---

## 🛠️ Usage

1. **Invite** the bot to your **target** server with the `Administrator` permission
2. **Drag** the bot's role to the **very top** of the role hierarchy
3. Make sure your selfbot account is a **member** of the source server
4. Run `/clone source_id target_id` in any text channel
5. **Toggle** cleanup/clone options using the interactive buttons
6. Click **🚀 Launch Migration** — progress updates appear in your DMs
7. Wait for the completion message!

---

## 💬 Commands

| Command | Description | Visibility |
|---------|-------------|:----------:|
| `/clone source_id target_id` | Start an interactive server migration | Public |
| `/help` | Display the usage guide | Ephemeral |
| `/status` | View bot diagnostics (uptime, ping, memory) | Ephemeral |

---

## ⚙️ Configuration

All settings live in `src/config.js`:

| Setting | Default | Description |
|---------|:-------:|-------------|
| `API_DELAY` | `800` | Milliseconds between Discord API calls. Lower = faster, higher = safer |
| `COLORS.PRISM` | `#00d4ff` | Primary embed accent colour |
| `COLORS.SUCCESS` | `#00ff88` | Completion/success embed colour |
| `COLORS.DANGER` | `#ff4b4b` | Error/expiry embed colour |

---

## 🤖 GitHub Actions

This project includes a GitHub Actions workflow (`.github/workflows/prism.yml`) for running the bot in the cloud.

**Setup:**
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `BOT_TOKEN`
   - `DC_TOKEN`
   - `ALLOWED_ID`
3. Trigger manually via **Actions** → **Prism Cloner** → **Run workflow**

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a **Pull Request**

Please follow the existing code style and add JSDoc comments to new functions.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## ⚠️ Disclaimer

> **This tool is for educational purposes only.**
>
> Using selfbots (User Tokens) violates [Discord's Terms of Service](https://discord.com/terms).
> The developers of Prism Cloner are **not responsible** for any account bans,
> data loss, or other consequences resulting from the use of this tool.
>
> **Use at your own risk.**

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6b00ff,100:00d4ff&height=100&section=footer" />
</p>

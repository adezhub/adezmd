# ADEZ MD WhatsApp Bot

A starter WhatsApp bot for ADEZ MD, built with Node.js and Baileys. It supports QR-code login, reconnects automatically, and includes useful command handlers that can be extended with ADEZ MD services.

## Features

- QR-code authentication in the terminal
- Persistent WhatsApp session in `.auth_info_baileys/`
- Commands: `help`, `ping`, `menu`, and `about`
- Case-insensitive commands with `/`, `!`, or no prefix
- Group-chat friendly behavior: responds only when mentioned or when a command is sent
- Environment-based configuration
- Graceful shutdown and automatic reconnects

## Requirements

- Node.js 20 or newer
- A WhatsApp account to pair with the bot

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Scan the QR code from WhatsApp on your phone:

**WhatsApp → Settings → Linked devices → Link a device**

The login session is stored locally and should not be committed or shared.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `BOT_NAME` | `ADEZ MD` | Name shown in replies |
| `BOT_PREFIX` | `/` | Preferred command prefix |
| `OWNER_NAME` | `ADEZ MD Team` | Bot owner/team label |
| `LOG_LEVEL` | `info` | Pino log level |

## Commands

- `/help` — show available commands
- `/ping` — check whether the bot is online
- `/menu` — show the ADEZ MD menu
- `/about` — show bot information

To add business workflows, extend `src/commands.js` and keep secrets in environment variables rather than source code.

## Important

Use this bot only with the consent of the WhatsApp account owner and in accordance with WhatsApp's terms and applicable privacy laws. Do not use it to provide emergency or diagnostic medical advice. For emergencies, users should contact local emergency services.

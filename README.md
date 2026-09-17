# ADEZ MD WhatsApp Bot

A WhatsApp bot for ADEZ MD using Node.js, Baileys, and a browser-based pairing page.

## Features

- WhatsApp pairing-code page at `/pair.html`
- QR-code fallback in the terminal
- Persistent authentication in `.auth_info_baileys/`
- Automatic reconnects
- `help`, `ping`, `menu`, and `about` commands
- JSON health endpoint at `/health`
- Basic pairing-code rate limiting

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000/pair.html`, enter the WhatsApp number in international format without `+`, and follow the instructions. The terminal QR code can also be used when the pairing page is unavailable.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `BOT_NAME` | `ADEZ MD` | Name shown in replies |
| `BOT_PREFIX` | `/` | Preferred command prefix |
| `OWNER_NAME` | `ADEZ MD Team` | Bot owner/team label |
| `LOG_LEVEL` | `info` | Pino log level |
| `PORT` | `3000` | HTTP port for the pairing page |

## Commands

- `/help` — show available commands
- `/ping` — check whether the bot is online
- `/menu` — show the ADEZ MD menu
- `/about` — show bot information

## Deployment notes

Use HTTPS when exposing the pairing page publicly, restrict access where possible, and never commit `.env` or `.auth_info_baileys/`. Pairing codes grant access to the WhatsApp account, so do not share them or log them. Use the bot only with account-owner consent and in accordance with WhatsApp's terms and applicable privacy laws. The bot does not provide emergency or diagnostic medical advice.

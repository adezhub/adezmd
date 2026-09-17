# ADEZ MD WhatsApp Bot

A WhatsApp bot for ADEZ MD using Node.js, Baileys, and a browser-based pairing page.

## Deploy on Render

This repository includes a Render Blueprint in `render.yaml`.

1. Open [Render](https://render.com) and sign in with GitHub.
2. Select **New → Blueprint**.
3. Select the `adezhub/adezmd` repository.
4. Review the service and click **Apply**.
5. Wait for the build to finish.
6. Open the generated Render URL followed by `/pair.html`.

Example:

```text
https://adez-md-whatsapp-bot.onrender.com/pair.html
```

Enter the WhatsApp number in international format without `+`, then use the returned code in WhatsApp under **Linked devices → Link a device**.

### Render requirements

The Blueprint uses a **Starter** web service and a 1 GB persistent disk. The persistent disk is required because WhatsApp authentication is stored in `.auth_info_baileys`. A free Render service may sleep and does not provide persistent storage, which can disconnect the bot and require pairing again.

Render supplies the `PORT` variable automatically; the app also defaults to port `3000` for local development. Do not commit `.env` or `.auth_info_baileys/`.

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000/pair.html`.

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

## Security

Use HTTPS when exposing the pairing page publicly and restrict access where possible. Pairing codes can link a WhatsApp account to the bot, so do not share or log them. Use the bot only with account-owner consent and in accordance with WhatsApp's terms and applicable privacy laws.

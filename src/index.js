require('dotenv').config();

const path = require('node:path');
const express = require('express');
const P = require('pino');
const terminalQr = require('qrcode-terminal');
const QRCode = require('qrcode');
const {
  default: makeWASocket,
  Browsers,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { config, handleCommand, isCommand } = require('./commands');

const logger = P({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
const port = Number(process.env.PORT || 3000);
const pairingRequests = new Map();
let reconnectTimer;
let starting = false;
let sock;
let currentQr;
let qrUpdatedAt;

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..')));

app.get('/health', (_request, response) => {
  response.json({ ok: true, connected: Boolean(sock?.user), qrAvailable: Boolean(currentQr), name: config.name });
});

app.get('/api/status', (_request, response) => {
  response.json({
    connected: Boolean(sock?.user),
    qrAvailable: Boolean(currentQr),
    name: config.name,
    started: Boolean(sock),
    updatedAt: qrUpdatedAt
  });
});

app.get('/api/qr', (_request, response) => {
  if (sock?.user) return response.json({ connected: true, qr: null });
  if (!currentQr) return response.status(404).json({ connected: false, qr: null, error: 'QR code is not ready yet.' });
  response.json({ connected: false, qr: currentQr, updatedAt: qrUpdatedAt });
});

app.post('/api/reconnect', async (_request, response) => {
  if (starting) {
    return response.status(202).json({ message: 'A reconnect is already in progress.' });
  }

  if (sock?.user) {
    return response.json({ connected: true, message: 'WhatsApp is already connected.' });
  }

  try {
    await startBot();
    return response.json({ ok: true, message: 'WhatsApp reconnect started.' });
  } catch (error) {
    logger.error({ err: error }, 'Reconnect request failed');
    return response.status(500).json({ error: 'Unable to reconnect WhatsApp right now.' });
  }
});

app.post('/api/pair', async (request, response) => {
  const phone = String(request.body?.phone || '').replace(/\D/g, '');

  if (!/^\d{8,15}$/.test(phone)) {
    return response.status(400).json({ error: 'Enter a valid international phone number.' });
  }

  const previousRequest = pairingRequests.get(phone);
  if (previousRequest && Date.now() - previousRequest < 60_000) {
    return response.status(429).json({ error: 'Please wait one minute before requesting another code.' });
  }

  if (!sock || sock.user) {
    return response.status(503).json({ error: 'Pairing is temporarily unavailable. Restart the bot if it is already linked.' });
  }

  pairingRequests.set(phone, Date.now());
  try {
    const code = await sock.requestPairingCode(phone);
    return response.json({ code });
  } catch (error) {
    pairingRequests.delete(phone);
    logger.error({ err: error }, 'Pairing code request failed');
    return response.status(502).json({ error: 'Unable to create a pairing code. Try again shortly.' });
  }
});

async function startBot() {
  if (starting) return;
  starting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState('.auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      browser: Browsers.ubuntu(config.name),
      logger,
      printQRInTerminal: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        currentQr = await QRCode.toDataURL(qr, { margin: 2, width: 320 });
        qrUpdatedAt = Date.now();
        console.log('\nScan this QR code in WhatsApp → Settings → Linked devices:\n');
        terminalQr.generate(qr, { small: true });
      }

      if (connection === 'open') {
        currentQr = undefined;
        qrUpdatedAt = undefined;
        logger.info(`${config.name} is connected`);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        sock = undefined;

        if (shouldReconnect) {
          logger.warn({ statusCode }, 'Connection closed; reconnecting');
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(startBot, 5000);
        } else {
          currentQr = undefined;
          logger.error('WhatsApp session was logged out. Delete .auth_info_baileys and pair again.');
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const message of messages) {
        if (!message.message || message.key.fromMe) continue;
        const remoteJid = message.key.remoteJid;
        if (!remoteJid || remoteJid === 'status@broadcast') continue;

        const text = getMessageText(message);
        if (!text || !isCommand(text)) continue;
        const reply = handleCommand(text);
        if (reply) await sock.sendMessage(remoteJid, { text: reply }, { quoted: message });
      }
    });
  } finally {
    starting = false;
  }
}

function getMessageText(message) {
  const content = message.message;
  return content.conversation || content.extendedTextMessage?.text ||
    content.imageMessage?.caption || content.videoMessage?.caption || '';
}

const server = app.listen(port, () => logger.info(`Pairing page available at http://localhost:${port}/pair.html`));

function shutdown() {
  clearTimeout(reconnectTimer);
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startBot().catch((error) => {
  logger.error({ err: error }, 'Failed to start bot');
  process.exitCode = 1;
});

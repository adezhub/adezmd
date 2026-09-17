require('dotenv').config();

const P = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  Browsers,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { config, handleCommand, isCommand } = require('./commands');

const logger = P({ level: process.env.LOG_LEVEL || 'info' });
let reconnectTimer;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('.auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    browser: Browsers.ubuntu(config.name),
    logger,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\nScan this QR code in WhatsApp → Settings → Linked devices:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      logger.info(`${config.name} is connected`);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        logger.warn({ statusCode }, 'Connection closed; reconnecting');
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(startBot, 5000);
      } else {
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

      const response = handleCommand(text);
      if (response) {
        await sock.sendMessage(remoteJid, { text: response }, { quoted: message });
      }
    }
  });
}

function getMessageText(message) {
  const content = message.message;
  return content.conversation ||
    content.extendedTextMessage?.text ||
    content.imageMessage?.caption ||
    content.videoMessage?.caption ||
    '';
}

process.on('SIGINT', () => {
  clearTimeout(reconnectTimer);
  process.exit(0);
});

process.on('SIGTERM', () => {
  clearTimeout(reconnectTimer);
  process.exit(0);
});

startBot().catch((error) => {
  logger.error({ err: error }, 'Failed to start bot');
  process.exitCode = 1;
});

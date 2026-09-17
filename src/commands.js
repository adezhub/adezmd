const config = {
  name: process.env.BOT_NAME || 'ADEZ MD',
  prefix: process.env.BOT_PREFIX || '/',
  owner: process.env.OWNER_NAME || 'ADEZ MD Team'
};

const menu = [
  `*${config.name}*`,
  '',
  '*Available commands:*',
  `${config.prefix}help - Show this help message`,
  `${config.prefix}ping - Check bot status`,
  `${config.prefix}menu - Show the ADEZ MD menu`,
  `${config.prefix}about - About this bot`,
  '',
  '_More services will be added soon._'
].join('\n');

function normalizeCommand(text) {
  const input = text.trim();
  const withoutPrefix = input.startsWith(config.prefix)
    ? input.slice(config.prefix.length)
    : input.startsWith('/') || input.startsWith('!')
      ? input.slice(1)
      : input;

  const [command, ...args] = withoutPrefix.trim().split(/\s+/);
  return { command: (command || '').toLowerCase(), args };
}

function isCommand(text) {
  const value = text.trim();
  return value.startsWith(config.prefix) || value.startsWith('/') || value.startsWith('!') || /^(help|ping|menu|about)$/i.test(value);
}

function handleCommand(text) {
  const { command } = normalizeCommand(text);

  switch (command) {
    case 'help':
      return menu;
    case 'ping':
      return '🏓 Pong! ADEZ MD bot is online.';
    case 'menu':
      return [
        `*${config.name} menu*`,
        '',
        '🩺 Medical information and support',
        '📅 Appointment enquiries',
        '📍 Clinic information',
        '',
        'Reply with *help* to see bot commands.'
      ].join('\n');
    case 'about':
      return [
        `*${config.name} WhatsApp bot*`,
        `Managed by: ${config.owner}`,
        'Version: 1.0.0',
        '',
        'This bot provides general information only. It does not replace a qualified clinician or emergency services.'
      ].join('\n');
    default:
      return null;
  }
}

module.exports = { config, handleCommand, isCommand };

const config = {
  name: process.env.BOT_NAME || 'ADEZ MD',
  prefix: process.env.BOT_PREFIX || '/',
  owner: process.env.OWNER_NAME || 'ADEZ MD Team'
};

const commandText = [
  `*${config.name}*`,
  '',
  '*Available commands:*',
  `${config.prefix}help - Show this help message`,
  `${config.prefix}ping - Check bot status`,
  `${config.prefix}menu - Show the ADEZ MD menu`,
  `${config.prefix}about - About this bot`,
  `${config.prefix}status - Check connection status`,
  '',
  '_More services will be added soon._'
].join('\n');

function normalizeCommand(text) {
  const input = String(text || '').trim();
  const cleaned = input
    .replace(new RegExp(`^${config.prefix}`, 'i'), '')
    .replace(/^[/!]+/, '')
    .replace(new RegExp(`${config.name}`, 'gi'), '')
    .trim();

  const [command, ...args] = cleaned.split(/\s+/);
  return { command: (command || '').toLowerCase(), args };
}

function isCommand(text) {
  const value = String(text || '').trim();
  const lower = value.toLowerCase();
  return value.startsWith(config.prefix) || value.startsWith('/') || value.startsWith('!') || /^(help|ping|menu|about|status|commands|hello|hi|start)$/i.test(lower) || lower.includes(config.name.toLowerCase());
}

function handleCommand(text) {
  const { command } = normalizeCommand(text);

  switch (command) {
    case 'help':
    case 'commands':
      return commandText;
    case 'ping':
    case 'status':
      return '✅ ADEZ MD is connected and ready.\nUse /help to see available commands.';
    case 'menu':
    case 'services':
      return [
        `*${config.name} menu*`,
        '',
        '🩺 Medical information and support',
        '📅 Appointment enquiries',
        '📍 Clinic information',
        '💬 WhatsApp bot support',
        '',
        'Reply with *help* to see bot commands.'
      ].join('\n');
    case 'about':
    case 'info':
    case 'whois':
      return [
        `*${config.name} WhatsApp bot*`,
        `Managed by: ${config.owner}`,
        'Version: 1.0.0',
        '',
        'This bot provides general information only. It does not replace a qualified clinician or emergency services.'
      ].join('\n');
    case 'hello':
    case 'hi':
      return `Hello! I am ${config.name}. Use *${config.prefix}help* to see the available commands.`;
    case 'start':
      return `✅ ${config.name} is online and ready to assist.`;
    default:
      return null;
  }
}

module.exports = { config, handleCommand, isCommand };

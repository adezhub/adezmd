const config = {
  name: process.env.BOT_NAME || 'ADEZ MD',
  prefix: process.env.BOT_PREFIX || '/',
  owner: process.env.OWNER_NAME || 'ADEZ MD Team'
};

const builtinCommands = [
  `${config.prefix}help - Show this help message`,
  `${config.prefix}ping - Check bot status`,
  `${config.prefix}menu - Show the ADEZ MD menu`,
  `${config.prefix}about - About this bot`,
  `${config.prefix}status - Connection status`,
  `${config.prefix}fb <link> - Open Facebook content`,
  `${config.prefix}yt <link> - Open YouTube content`,
  `${config.prefix}play <query> - Search media content`
];

const menu = [
  `*${config.name}*`,
  '',
  '*Available commands:*',
  ...builtinCommands,
  '',
  '_More services will be added soon._'
].join('\n');

function normalizeCommand(text) {
  const input = String(text || '').trim();
  const cleaned = input
    .replace(new RegExp(`^${config.prefix}`, 'i'), '')
    .replace(/^[/!]+/, '')
    .trim();

  const [command, ...args] = cleaned.split(/\s+/);
  return { command: (command || '').toLowerCase(), args };
}

function isCommand(text) {
  const value = String(text || '').trim();
  const lower = value.toLowerCase();
  return value.startsWith(config.prefix) || value.startsWith('/') || value.startsWith('!') ||
    /^(help|ping|menu|about|status|fb|yt|play|hello|hi|start)$/i.test(lower) ||
    lower.includes('adez md') || lower.includes('adezmd');
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function formatLinkResponse(platform, link) {
  if (!isValidUrl(link)) {
    return `⚠️ Please provide a valid ${platform} URL. Example: ${config.prefix}${platform} https://example.com`;
  }

  return `✅ ${platform.toUpperCase()} request accepted.\nLink: ${link}\nPlease open the link in a browser to continue.`;
}

function handleCommand(text) {
  const { command, args } = normalizeCommand(text);
  const value = (args || []).join(' ');

  switch (command) {
    case 'help':
    case 'commands':
      return menu;

    case 'ping':
      return '🏓 Pong! ADEZ MD bot is online and connected.';

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
        '📺 Media and content access',
        '',
        'Reply with *help* to see bot commands.'
      ].join('\n');

    case 'about':
    case 'info':
      return [
        `*${config.name} WhatsApp bot*`,
        `Managed by: ${config.owner}`,
        'Version: 1.0.0',
        '',
        'This bot provides general information only. It does not replace a qualified clinician or emergency services.'
      ].join('\n');

    case 'fb':
      return formatLinkResponse('facebook', value);

    case 'yt':
    case 'youtube':
      return formatLinkResponse('youtube', value);

    case 'play':
      if (!value) return '🎵 Please provide a song, video, or search term. Example: /play love songs';
      return `🎵 Media request received: "${value}"\nI can help queue or search this content. Use a supported media provider or link to continue.`;

    case 'hello':
    case 'hi':
      return `Hello! I am ${config.name}. Use *${config.prefix}help* to see available commands.`;

    case 'start':
      return `✅ ${config.name} is online and ready to assist.`;

    default:
      return null;
  }
}

module.exports = { config, handleCommand, isCommand };

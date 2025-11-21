// Simple authentication script to get Telegram session string
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const fs = require('fs').promises;
const path = require('path');

const config = {
  apiId: 23885359,
  apiHash: 'f12c7a91d6ff92b6edc467e514e3edde',
  phoneNumber: '+18087631153'
};

async function authenticate() {
  console.log('🔐 Authenticating with Telegram...\n');

  const client = new TelegramClient(
    new StringSession(''),
    config.apiId,
    config.apiHash,
    { connectionRetries: 5 }
  );

  await client.start({
    phoneNumber: async () => config.phoneNumber,
    password: async () => {
      const pwd = await input.text('Enter 2FA password (or press Enter if none): ');
      return pwd || undefined;
    },
    phoneCode: async () => {
      return await input.text('Enter the code Telegram sent to +18087631153: ');
    },
    onError: (err) => console.error('Error:', err),
  });

  const sessionString = client.session.save();
  console.log('\n✅ Authentication successful!');
  console.log('\n📱 Session string obtained');

  // Update config file
  const configPath = path.join(__dirname, 'intelligent-userbot-config.json');
  const configData = JSON.parse(await fs.readFile(configPath, 'utf8'));
  configData.telegram.sessionString = sessionString;
  await fs.writeFile(configPath, JSON.stringify(configData, null, 2));

  console.log('✅ Config file updated with session string');

  await client.disconnect();
  console.log('\n🎉 Ready for deployment!');
  process.exit(0);
}

authenticate().catch(console.error);

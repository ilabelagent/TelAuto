#!/usr/bin/env node

// bot-wrapper.js - A wrapper to fix all import and configuration issues
const path = require('path');
const fs = require('fs').promises;
const readline = require('readline');

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Create readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promise wrapper for readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Custom input module replacement
global.input = {
  text: async (prompt) => {
    const answer = await question(prompt);
    return answer;
  },
  password: async (prompt) => {
    const answer = await question(prompt);
    return answer;
  }
};

async function loadAndFixConfig() {
  try {
    // Try multiple config locations
    const configPaths = [
      path.join(process.env.APPDATA, 'telegram-userbot-gui', 'intelligent-userbot-config.json'),
      path.join(__dirname, 'intelligent-userbot-config.json'),
      path.join(__dirname, '..', 'intelligent-userbot-config.json')
    ];

    let config = null;
    let configPath = null;

    for (const tryPath of configPaths) {
      try {
        const data = await fs.readFile(tryPath, 'utf8');
        config = JSON.parse(data);
        configPath = tryPath;
        console.log(`${colors.green}✓ Found config at: ${tryPath}${colors.reset}`);
        break;
      } catch (e) {
        // Continue trying other paths
      }
    }

    if (!config) {
      throw new Error('No configuration file found. Please run the GUI setup first.');
    }

    // Fix config structure
    if (!config.telegram) {
      throw new Error('Invalid configuration: missing telegram section');
    }

    // Ensure all required fields exist
    config.telegram.sessionString = config.telegram.sessionString || '';
    
    // Add automation section if missing
    if (!config.automation) {
      config.automation = {
        enabled: true,
        responseMode: 'adaptive',
        autoReply: true,
        typingDelay: true,
        readReceipts: true,
        activeHours: {
          start: 9,
          end: 23
        }
      };
    }

    // Add stats section if missing
    if (!config.stats) {
      config.stats = {
        messagesProcessed: 0,
        successfulResponses: 0,
        failedResponses: 0,
        learningEvents: 0,
        averageConfidence: 0
      };
    }

    // Fix personality structure if needed
    if (config.personality && typeof config.personality.professional === 'number' && config.personality.professional > 1) {
      // Convert from percentages to decimals
      const traits = {};
      for (const [key, value] of Object.entries(config.personality)) {
        traits[key] = value / 100;
      }
      config.personality = {
        name: 'You',
        style: 'adaptive',
        traits: traits
      };
    }

    return { config, configPath };
  } catch (error) {
    console.error(`${colors.red}Config error: ${error.message}${colors.reset}`);
    throw error;
  }
}

async function startBot() {
  console.log(`${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║      🤖 INTELLIGENT TELEGRAM USERBOT LAUNCHER 🤖          ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  try {
    // Load and fix configuration
    console.log(`${colors.cyan}Loading configuration...${colors.reset}`);
    const { config, configPath } = await loadAndFixConfig();

    // Set up the global config variable
    global.config = config;

    // Now we need to handle the bot's imports properly
    console.log(`${colors.cyan}Setting up Telegram client...${colors.reset}`);
    
    // Import Telegram modules
    const { TelegramClient, Api } = require('telegram');
    const { StringSession } = require('telegram/sessions');
    const { NewMessage } = require('telegram/events');
    
    // Import AI modules (with error handling)
    let Anthropic, GoogleGenerativeAI;
    try {
      Anthropic = require('@anthropic-ai/sdk');
    } catch (e) {
      console.log(`${colors.yellow}Claude AI not available${colors.reset}`);
    }
    try {
      GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
    } catch (e) {
      console.log(`${colors.yellow}Gemini AI not available${colors.reset}`);
    }

    // Create simplified bot class
    class SimplifiedTelegramBot {
      constructor(config) {
        this.config = config;
        this.client = null;
        this.aiManager = null;
      }

      async initialize() {
        try {
          // Create Telegram client
          this.client = new TelegramClient(
            new StringSession(this.config.telegram.sessionString),
            parseInt(this.config.telegram.apiId),
            this.config.telegram.apiHash,
            { connectionRetries: 5 }
          );

          // Start client
          console.log(`${colors.cyan}Connecting to Telegram...${colors.reset}`);
          
          if (!this.config.telegram.sessionString) {
            console.log(`${colors.yellow}First time setup - authentication required${colors.reset}`);
            
            await this.client.start({
              phoneNumber: () => Promise.resolve(this.config.telegram.phoneNumber),
              password: async () => {
                const pass = await question('Enter 2FA password (or press Enter if not enabled): ');
                return pass;
              },
              phoneCode: async () => {
                console.log(`${colors.bright}${colors.yellow}`);
                console.log('╔════════════════════════════════════════════╗');
                console.log('║     CHECK YOUR TELEGRAM APP FOR CODE!      ║');
                console.log('╚════════════════════════════════════════════╝');
                console.log(`${colors.reset}`);
                const code = await question('Enter verification code: ');
                return code;
              },
              onError: (err) => console.error(err),
            });

            // Save session
            this.config.telegram.sessionString = this.client.session.save();
            await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
            console.log(`${colors.green}✓ Authentication successful!${colors.reset}`);
          } else {
            await this.client.connect();
          }

          const me = await this.client.getMe();
          console.log(`${colors.green}✓ Logged in as ${me.firstName} ${me.lastName || ''}${colors.reset}`);

          // Set up message handler
          this.setupMessageHandler();

          console.log(`${colors.bright}${colors.green}`);
          console.log('╔════════════════════════════════════════════╗');
          console.log('║        BOT IS NOW RUNNING! 🚀              ║');
          console.log('║                                            ║');
          console.log('║  The bot will auto-reply to messages      ║');
          console.log('║  Press Ctrl+C to stop                      ║');
          console.log('╚════════════════════════════════════════════╝');
          console.log(`${colors.reset}`);

        } catch (error) {
          console.error(`${colors.red}Initialization error: ${error.message}${colors.reset}`);
          throw error;
        }
      }

      setupMessageHandler() {
        this.client.addEventHandler(async (event) => {
          try {
            const message = event.message;
            if (!message || !message.text || message.isChannel) return;

            // Don't reply to own messages
            const me = await this.client.getMe();
            if (message.senderId.toString() === me.id.toString()) return;

            const sender = await this.client.getEntity(message.senderId);
            const senderName = sender.firstName || 'User';

            console.log(`${colors.cyan}[${new Date().toLocaleTimeString()}] ${senderName}: ${message.text}${colors.reset}`);

            // Simple response for now
            const response = await this.generateResponse(message.text, senderName);

            await this.client.sendMessage(message.chatId, { 
              message: response 
            });

            console.log(`${colors.green}[${new Date().toLocaleTimeString()}] You: ${response}${colors.reset}`);

          } catch (error) {
            console.error(`${colors.red}Message handler error: ${error.message}${colors.reset}`);
          }
        }, new NewMessage({ incoming: true }));
      }

      async generateResponse(message, senderName) {
        // Try AI providers if available
        if (this.config.ai.claudeKey && Anthropic) {
          try {
            const anthropic = new Anthropic({ apiKey: this.config.ai.claudeKey });
            const response = await anthropic.messages.create({
              model: 'claude-3-opus-20240229',
              max_tokens: 150,
              messages: [{
                role: 'user',
                content: `You are responding as a helpful assistant. ${senderName} says: "${message}". Respond naturally and briefly.`
              }]
            });
            return response.content[0].text;
          } catch (error) {
            console.error(`${colors.yellow}AI error: ${error.message}${colors.reset}`);
          }
        }

        // Fallback responses
        const responses = [
          "Thanks for your message! I'll get back to you soon.",
          "Got it! Let me check on that.",
          "Interesting! Tell me more.",
          "I understand. Give me a moment to think about this.",
          "Thanks for reaching out!"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Create and start bot
    const bot = new SimplifiedTelegramBot(config);
    await bot.initialize();

    // Keep the process alive
    process.stdin.resume();

  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    console.log(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
    console.log('1. Make sure you completed the GUI setup first');
    console.log('2. Check that your API credentials are correct');
    console.log('3. Ensure your phone number includes country code (e.g., +1234567890)');
    console.log('4. Try deleting the config file and running setup again');
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
  rl.close();
  process.exit(0);
});

// Start the bot
startBot().catch(console.error);
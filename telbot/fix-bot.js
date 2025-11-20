#!/usr/bin/env node

// fix-bot.js - Fix script for Telegram UserBot GUI issues

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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

// Fixed main.js content
const fixedMainJs = `const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  // Load the built file
  mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  
  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('save-config', async (event, config) => {
  try {
    console.log('Saving configuration...');
    const configPath = path.join(app.getPath('userData'), 'intelligent-userbot-config.json');
    
    // For now, we'll save without authentication
    // The bot will handle authentication when it starts
    
    // Add default values
    config.telegram.sessionString = ''; // Will be set by bot on first run
    
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
    
    config.stats = {
      messagesProcessed: 0,
      successfulResponses: 0,
      failedResponses: 0,
      learningEvents: 0,
      averageConfidence: 0
    };
    
    // Convert personality percentages to decimals
    const personalityTraits = {};
    for (const [trait, value] of Object.entries(config.personality)) {
      personalityTraits[trait] = value / 100;
    }
    
    config.personality = {
      name: 'You',
      style: 'adaptive',
      traits: personalityTraits
    };
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log('Configuration saved to:', configPath);
    
    return { 
      success: true, 
      message: 'Configuration saved! Please run the bot from terminal to complete authentication.',
      configPath: configPath 
    };
  } catch (error) {
    console.error('Save config error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-bot', async () => {
  try {
    // Don't start the bot from here - it needs terminal access
    return { 
      success: false, 
      message: 'Please start the bot from your terminal using: npm run bot',
      needsTerminal: true 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});`;

// Fixed SetupWizard to handle the save properly
const fixedSetupWizardSnippet = `
  const saveConfiguration = async () => {
    if (window.electron) {
      const result = await window.electron.saveConfig(config);
      if (result.success) {
        if (result.needsTerminal) {
          alert('Configuration saved!\\n\\nTo complete setup and start the bot:\\n1. Close this window\\n2. In your terminal, run: npm run bot\\n3. Enter the Telegram verification code when prompted');
        } else {
          alert(result.message || 'Configuration saved successfully!');
          if (result.configPath) {
            console.log('Config saved to:', result.configPath);
          }
        }
      } else {
        alert('Error saving configuration: ' + result.error);
      }
    }
  };
`;

// Bot runner script
const botRunnerScript = `#!/usr/bin/env node
// bot-runner.js - Runs the bot with proper terminal access

const path = require('path');
const { spawn } = require('child_process');

console.log('Starting Telegram UserBot...');
console.log('This will handle authentication properly in the terminal.');
console.log('');

const botPath = path.join(__dirname, 'src/bot/intelligent-telegram-userbot.js');
const nodeProcess = spawn('node', [botPath], {
  stdio: 'inherit',
  shell: true
});

nodeProcess.on('error', (error) => {
  console.error('Failed to start bot:', error);
});

nodeProcess.on('exit', (code) => {
  console.log('Bot exited with code:', code);
});
`;

async function fixBot() {
  console.log(`${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║           🔧 TELEGRAM USERBOT GUI FIX SCRIPT 🔧           ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  try {
    // Step 1: Fix main.js
    console.log(`${colors.cyan}Step 1: Fixing main.js...${colors.reset}`);
    await fs.writeFile('telegram-userbot-gui/src/main/main.js', fixedMainJs);
    console.log(`${colors.green}✓ Fixed main.js${colors.reset}`);

    // Step 2: Create bot runner script
    console.log(`\n${colors.cyan}Step 2: Creating bot runner script...${colors.reset}`);
    await fs.writeFile('telegram-userbot-gui/bot-runner.js', botRunnerScript);
    console.log(`${colors.green}✓ Created bot-runner.js${colors.reset}`);

    // Step 3: Update package.json scripts
    console.log(`\n${colors.cyan}Step 3: Updating package.json...${colors.reset}`);
    const packageJsonPath = 'telegram-userbot-gui/package.json';
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    packageJson.scripts.bot = 'node bot-runner.js';
    packageJson.scripts['setup-only'] = 'electron . --setup-only';
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${colors.green}✓ Updated package.json${colors.reset}`);

    // Step 4: Install missing dependency
    console.log(`\n${colors.cyan}Step 4: Installing missing 'input' package...${colors.reset}`);
    process.chdir('telegram-userbot-gui');
    
    try {
      await execPromise('npm install input');
      console.log(`${colors.green}✓ Installed 'input' package${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}Warning: Could not install 'input' package automatically${colors.reset}`);
      console.log(`${colors.yellow}Please run manually: npm install input${colors.reset}`);
    }

    // Step 5: Rebuild
    console.log(`\n${colors.cyan}Step 5: Rebuilding application...${colors.reset}`);
    try {
      await execPromise('npm run build');
      console.log(`${colors.green}✓ Rebuilt application${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}Warning: Build failed, you may need to run 'npm run build' manually${colors.reset}`);
    }

    console.log(`\n${colors.bright}${colors.green}
╔════════════════════════════════════════════════════════════╗
║                    ✅ FIX COMPLETE! ✅                     ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}The bot is now fixed! Here's how to use it:${colors.reset}

${colors.yellow}1. First, configure the bot:${colors.reset}
   npm start
   
   ${colors.blue}→ Go through the setup wizard${colors.reset}
   ${colors.blue}→ Enter your API credentials${colors.reset}
   ${colors.blue}→ Click "Complete Setup"${colors.reset}
   ${colors.blue}→ Close the window when done${colors.reset}

${colors.yellow}2. Then, start the bot from terminal:${colors.reset}
   npm run bot
   
   ${colors.blue}→ The bot will ask for verification code${colors.reset}
   ${colors.blue}→ Check your Telegram app${colors.reset}
   ${colors.blue}→ Enter the code in the terminal${colors.reset}

${colors.magenta}Why two steps?${colors.reset}
The GUI can't handle Telegram's authentication properly.
So we save config in the GUI, then authenticate in terminal.

${colors.red}Important:${colors.reset} Make sure you're in the 'telegram-userbot-gui' folder!
`);

  } catch (error) {
    console.error(`${colors.red}Fix failed: ${error.message}${colors.reset}`);
  }
}

// Run the fix
if (require.main === module) {
  fixBot();
}

module.exports = fixBot;
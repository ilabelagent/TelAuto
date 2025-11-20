const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
});
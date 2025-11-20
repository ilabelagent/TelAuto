#!/usr/bin/env node
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

#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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

// SetupWizard Component Content
const setupWizardContent = `import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Bot, Key, Brain, Settings, CheckCircle, AlertCircle, Loader, User, MessageSquare, Sparkles } from 'lucide-react';

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    telegram: {
      apiId: '',
      apiHash: '',
      phoneNumber: '',
      adminUsername: '',
      adminId: ''
    },
    ai: {
      provider: 'claude',
      claudeKey: '',
      geminiKey: ''
    },
    learning: {
      enabled: true,
      autoLearn: true,
      requireApproval: true,
      improvementThreshold: 0.7,
      maxMemorySize: 1000
    },
    personality: {
      professional: 50,
      friendly: 70,
      humorous: 30,
      formal: 30,
      empathetic: 60
    }
  });

  const [errors, setErrors] = useState({});
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [twoFAPassword, setTwoFAPassword] = useState('');

  const steps = [
    { id: 'welcome', title: 'Welcome', icon: Bot },
    { id: 'telegram', title: 'Telegram Setup', icon: MessageSquare },
    { id: 'admin', title: 'Admin Config', icon: User },
    { id: 'ai', title: 'AI Provider', icon: Brain },
    { id: 'learning', title: 'Learning Settings', icon: Sparkles },
    { id: 'personality', title: 'Personality', icon: Settings },
    { id: 'review', title: 'Review & Finish', icon: CheckCircle }
  ];

  const validateStep = () => {
    const newErrors = {};
    
    switch (steps[currentStep].id) {
      case 'telegram':
        if (!config.telegram.apiId) newErrors.apiId = 'API ID is required';
        if (!config.telegram.apiHash) newErrors.apiHash = 'API Hash is required';
        if (!config.telegram.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        break;
      case 'ai':
        if (config.ai.provider === 'claude' && !config.ai.claudeKey) {
          newErrors.claudeKey = 'Claude API key is required';
        }
        if (config.ai.provider === 'gemini' && !config.ai.geminiKey) {
          newErrors.geminiKey = 'Gemini API key is required';
        }
        if (config.ai.provider === 'both' && !config.ai.claudeKey && !config.ai.geminiKey) {
          newErrors.provider = 'At least one API key is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const saveConfiguration = async () => {
    if (window.electron) {
      const result = await window.electron.saveConfig(config);
      if (result.success) {
        alert('Configuration saved successfully! The bot will now start.');
        // Start the bot
        const botResult = await window.electron.startBot();
        if (botResult.success) {
          alert('Bot is running!');
        } else {
          alert('Error starting bot: ' + botResult.error);
        }
      } else {
        alert('Error saving configuration: ' + result.error);
      }
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Intelligent Telegram UserBot</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Welcome to the setup wizard! This AI-powered bot learns from your interactions and improves over time.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">Key Features:</h3>
              <ul className="text-left text-blue-800 space-y-1">
                <li>• Self-learning AI that adapts to your style</li>
                <li>• Automated responses with personality</li>
                <li>• Feedback system for continuous improvement</li>
                <li>• Support for Claude and Gemini AI</li>
              </ul>
            </div>
          </div>
        );

      case 'telegram':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Telegram API Credentials</h2>
              <p className="text-gray-600">
                You'll need to get these from <a href="https://my.telegram.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">my.telegram.org</a>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API ID</label>
                <input
                  type="number"
                  value={config.telegram.apiId}
                  onChange={(e) => updateConfig('telegram', 'apiId', e.target.value)}
                  className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 \${errors.apiId ? 'border-red-500' : 'border-gray-300'}\`}
                  placeholder="12345678"
                />
                {errors.apiId && <p className="text-red-500 text-sm mt-1">{errors.apiId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Hash</label>
                <input
                  type="text"
                  value={config.telegram.apiHash}
                  onChange={(e) => updateConfig('telegram', 'apiHash', e.target.value)}
                  className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 \${errors.apiHash ? 'border-red-500' : 'border-gray-300'}\`}
                  placeholder="abcdef123456..."
                />
                {errors.apiHash && <p className="text-red-500 text-sm mt-1">{errors.apiHash}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={config.telegram.phoneNumber}
                  onChange={(e) => updateConfig('telegram', 'phoneNumber', e.target.value)}
                  className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 \${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}\`}
                  placeholder="+1234567890"
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            {isAuthenticating && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Loader className="w-5 h-5 text-yellow-600 animate-spin" />
                  <p className="text-yellow-800 font-medium">Authentication Required</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                  <input
                    type="text"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">2FA Password (if enabled)</label>
                  <input
                    type="password"
                    value={twoFAPassword}
                    onChange={(e) => setTwoFAPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Configuration</h2>
              <p className="text-gray-600">
                The admin can provide feedback to help the bot learn and improve its responses.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Username (Optional)</label>
                <input
                  type="text"
                  value={config.telegram.adminUsername}
                  onChange={(e) => updateConfig('telegram', 'adminUsername', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="@username"
                />
                <p className="text-sm text-gray-500 mt-1">Leave empty if you don't want admin features</p>
              </div>

              {config.telegram.adminUsername && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin User ID</label>
                  <input
                    type="text"
                    value={config.telegram.adminId}
                    onChange={(e) => updateConfig('telegram', 'adminId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="123456789"
                  />
                  <p className="text-sm text-gray-500 mt-1">You can get this using @userinfobot on Telegram</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Admin Commands:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• /feedback stats - View learning statistics</li>
                <li>• /feedback review - Review pending responses</li>
                <li>• /feedback improve - Provide better responses</li>
                <li>• /feedback personality - View personality traits</li>
              </ul>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Provider Setup</h2>
              <p className="text-gray-600">Choose your AI provider and enter the API key</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
                <div className="grid grid-cols-3 gap-3">
                  {['claude', 'gemini', 'both'].map(provider => (
                    <button
                      key={provider}
                      onClick={() => updateConfig('ai', 'provider', provider)}
                      className={\`p-3 border rounded-lg capitalize transition-colors \${
                        config.ai.provider === provider
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }\`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
              </div>

              {(config.ai.provider === 'claude' || config.ai.provider === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claude API Key</label>
                  <input
                    type="password"
                    value={config.ai.claudeKey}
                    onChange={(e) => updateConfig('ai', 'claudeKey', e.target.value)}
                    className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 \${errors.claudeKey ? 'border-red-500' : 'border-gray-300'}\`}
                    placeholder="sk-ant-..."
                  />
                  {errors.claudeKey && <p className="text-red-500 text-sm mt-1">{errors.claudeKey}</p>}
                </div>
              )}

              {(config.ai.provider === 'gemini' || config.ai.provider === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                  <input
                    type="password"
                    value={config.ai.geminiKey}
                    onChange={(e) => updateConfig('ai', 'geminiKey', e.target.value)}
                    className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 \${errors.geminiKey ? 'border-red-500' : 'border-gray-300'}\`}
                    placeholder="AIza..."
                  />
                  {errors.geminiKey && <p className="text-red-500 text-sm mt-1">{errors.geminiKey}</p>}
                </div>
              )}
            </div>

            {errors.provider && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.provider}</p>
              </div>
            )}
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Learning Settings</h2>
              <p className="text-gray-600">Configure how the bot learns and improves</p>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-700">Enable Learning System</p>
                  <p className="text-sm text-gray-500">Bot will learn from interactions</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.learning.enabled}
                  onChange={(e) => updateConfig('learning', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-700">Automatic Learning</p>
                  <p className="text-sm text-gray-500">Learn without explicit feedback</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.learning.autoLearn}
                  onChange={(e) => updateConfig('learning', 'autoLearn', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-700">Require Admin Approval</p>
                  <p className="text-sm text-gray-500">Admin must approve learning patterns</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.learning.requireApproval}
                  onChange={(e) => updateConfig('learning', 'requireApproval', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Threshold: {(config.learning.improvementThreshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.learning.improvementThreshold * 100}
                  onChange={(e) => updateConfig('learning', 'improvementThreshold', e.target.value / 100)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum confidence required for auto-learning
                </p>
              </div>
            </div>
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bot Personality</h2>
              <p className="text-gray-600">Adjust the bot's personality traits</p>
            </div>
            
            <div className="space-y-6">
              {Object.entries(config.personality).map(([trait, value]) => (
                <div key={trait}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {trait}
                    </label>
                    <span className="text-sm text-gray-600">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => updateConfig('personality', trait, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                These traits will evolve based on feedback. The bot will learn which traits work best in different situations.
              </p>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Configuration</h2>
              <p className="text-gray-600">Please review your settings before finishing</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Telegram</h3>
                <div className="space-y-1 text-sm">
                  <p>API ID: {config.telegram.apiId || 'Not set'}</p>
                  <p>Phone: {config.telegram.phoneNumber || 'Not set'}</p>
                  <p>Admin: {config.telegram.adminUsername || 'Not configured'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">AI Provider</h3>
                <div className="space-y-1 text-sm">
                  <p>Provider: {config.ai.provider}</p>
                  <p>Claude: {config.ai.claudeKey ? '✓ Configured' : '✗ Not set'}</p>
                  <p>Gemini: {config.ai.geminiKey ? '✓ Configured' : '✗ Not set'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Learning</h3>
                <div className="space-y-1 text-sm">
                  <p>Learning: {config.learning.enabled ? 'Enabled' : 'Disabled'}</p>
                  <p>Auto-learn: {config.learning.autoLearn ? 'Yes' : 'No'}</p>
                  <p>Approval: {config.learning.requireApproval ? 'Required' : 'Not required'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={saveConfiguration}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Setup
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={\`flex items-center \${index < steps.length - 1 ? 'flex-1' : ''}\`}
                >
                  <div
                    className={\`flex items-center justify-center w-10 h-10 rounded-full transition-colors \${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }\`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={\`flex-1 h-1 mx-2 transition-colors \${
                        index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }\`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={\`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors \${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }\`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={\`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors \${
              currentStep === steps.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }\`}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;`;

// Main setup script
async function setup() {
  console.log(`${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║      🤖 INTELLIGENT TELEGRAM USERBOT AUTO-SETUP 🤖        ║
║                                                            ║
║   This script will automatically set up everything!        ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  try {
    // Step 1: Check if the bot file exists
    console.log(`\n${colors.cyan}Step 1: Checking for bot file...${colors.reset}`);
    const botFilePath = process.argv[2] || './intelligent-telegram-userbot.js';
    
    try {
      await fs.access(botFilePath);
      console.log(`${colors.green}✓ Found bot file at: ${botFilePath}${colors.reset}`);
    } catch {
      console.error(`${colors.red}✗ Bot file not found at: ${botFilePath}${colors.reset}`);
      console.log(`${colors.yellow}Please provide the path to your intelligent-telegram-userbot.js file as an argument:${colors.reset}`);
      console.log(`${colors.yellow}node setup.js /path/to/intelligent-telegram-userbot.js${colors.reset}`);
      process.exit(1);
    }

    // Step 2: Create directory structure
    console.log(`\n${colors.cyan}Step 2: Creating directory structure...${colors.reset}`);
    const dirs = [
      'telegram-userbot-gui',
      'telegram-userbot-gui/src',
      'telegram-userbot-gui/src/components',
      'telegram-userbot-gui/src/main',
      'telegram-userbot-gui/src/renderer',
      'telegram-userbot-gui/src/bot',
      'telegram-userbot-gui/public'
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
      console.log(`${colors.green}✓ Created: ${dir}${colors.reset}`);
    }

    // Step 3: Create package.json
    console.log(`\n${colors.cyan}Step 3: Creating package.json...${colors.reset}`);
    const packageJson = {
      "name": "telegram-userbot-gui",
      "version": "1.0.0",
      "description": "Intelligent Telegram UserBot with GUI Setup",
      "main": "src/main/main.js",
      "scripts": {
        "start": "electron .",
        "build": "webpack",
        "dev": "webpack --watch & electron .",
        "pack": "electron-builder",
        "dist": "electron-builder --publish=never"
      },
      "build": {
        "appId": "com.telegram.userbot",
        "productName": "Telegram UserBot",
        "directories": {
          "output": "dist"
        },
        "files": [
          "src/**/*",
          "public/**/*",
          "node_modules/**/*",
          "dist/**/*"
        ]
      },
      "devDependencies": {
        "electron": "^27.0.0",
        "electron-builder": "^24.0.0",
        "@babel/core": "^7.23.0",
        "@babel/preset-react": "^7.22.0",
        "babel-loader": "^9.1.0",
        "css-loader": "^6.8.0",
        "style-loader": "^3.3.0",
        "webpack": "^5.88.0",
        "webpack-cli": "^5.1.0",
        "html-webpack-plugin": "^5.5.0"
      },
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.263.1",
        "telegram": "^2.19.0",
        "@anthropic-ai/sdk": "^0.9.0",
        "@google/generative-ai": "^0.1.0",
        "input": "^1.0.1"
      }
    };

    await fs.writeFile('telegram-userbot-gui/package.json', JSON.stringify(packageJson, null, 2));
    console.log(`${colors.green}✓ Created package.json${colors.reset}`);

    // Step 4: Create webpack.config.js
    console.log(`\n${colors.cyan}Step 4: Creating webpack.config.js...${colors.reset}`);
    const webpackConfig = `const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/renderer/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  target: 'electron-renderer'
};`;

    await fs.writeFile('telegram-userbot-gui/webpack.config.js', webpackConfig);
    console.log(`${colors.green}✓ Created webpack.config.js${colors.reset}`);

    // Step 5: Create .gitignore
    console.log(`\n${colors.cyan}Step 5: Creating .gitignore...${colors.reset}`);
    const gitignore = `node_modules/
dist/
*.log
intelligent-userbot-config.json
learning-data.json
.env
.DS_Store`;

    await fs.writeFile('telegram-userbot-gui/.gitignore', gitignore);
    console.log(`${colors.green}✓ Created .gitignore${colors.reset}`);

    // Step 6: Create HTML file
    console.log(`\n${colors.cyan}Step 6: Creating HTML template...${colors.reset}`);
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram UserBot Setup</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;

    await fs.writeFile('telegram-userbot-gui/public/index.html', htmlContent);
    console.log(`${colors.green}✓ Created index.html${colors.reset}`);

    // Step 7: Create main.js (Electron main process)
    console.log(`\n${colors.cyan}Step 7: Creating Electron main process...${colors.reset}`);
    const mainJs = `const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

let mainWindow;
let telegramClient;

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

  // In production, load the built file
  mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));

  // For development, uncomment this:
  // mainWindow.loadURL('http://localhost:8080');
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
    const configPath = path.join(app.getPath('userData'), 'intelligent-userbot-config.json');
    
    // If we need to authenticate first
    if (!config.telegram.sessionString && config.telegram.apiId) {
      try {
        telegramClient = new TelegramClient(
          new StringSession(''),
          parseInt(config.telegram.apiId),
          config.telegram.apiHash,
          { connectionRetries: 5 }
        );

        await telegramClient.start({
          phoneNumber: () => Promise.resolve(config.telegram.phoneNumber),
          password: async () => await mainWindow.webContents.executeJavaScript('prompt("Enter 2FA password if enabled:")'),
          phoneCode: async () => await mainWindow.webContents.executeJavaScript('prompt("Enter the verification code:")'),
          onError: (err) => console.error(err),
        });

        config.telegram.sessionString = telegramClient.session.save();
      } catch (authError) {
        return { success: false, error: 'Authentication failed: ' + authError.message };
      }
    }
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return { success: true, message: 'Configuration saved successfully!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-bot', async () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'intelligent-userbot-config.json');
    const { startBot } = require('../bot/intelligent-telegram-userbot.js');
    await startBot(configPath);
    return { success: true, message: 'Bot started successfully!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});`;

    await fs.writeFile('telegram-userbot-gui/src/main/main.js', mainJs);
    console.log(`${colors.green}✓ Created main.js${colors.reset}`);

    // Step 8: Create renderer index.js
    console.log(`\n${colors.cyan}Step 8: Creating renderer process...${colors.reset}`);
    const rendererJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import SetupWizard from '../components/SetupWizard';

// Create electron API bridge
window.electron = {
  saveConfig: (config) => window.require('electron').ipcRenderer.invoke('save-config', config),
  startBot: () => window.require('electron').ipcRenderer.invoke('start-bot')
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SetupWizard />);`;

    await fs.writeFile('telegram-userbot-gui/src/renderer/index.js', rendererJs);
    console.log(`${colors.green}✓ Created renderer index.js${colors.reset}`);

    // Step 9: Create SetupWizard component
    console.log(`\n${colors.cyan}Step 9: Creating SetupWizard component...${colors.reset}`);
    await fs.writeFile('telegram-userbot-gui/src/components/SetupWizard.jsx', setupWizardContent);
    console.log(`${colors.green}✓ Created SetupWizard.jsx${colors.reset}`);

    // Step 10: Copy and modify bot file
    console.log(`\n${colors.cyan}Step 10: Copying and modifying bot file...${colors.reset}`);
    let botContent = await fs.readFile(botFilePath, 'utf8');
    
    // Add export at the end if not present
    if (!botContent.includes('module.exports')) {
      botContent += `\n\n// Export for GUI integration
module.exports = {
  startBot: async (configPath) => {
    // Load config from the provided path
    const configData = await fs.readFile(configPath, 'utf8');
    config = JSON.parse(configData);
    
    // Start the bot
    const bot = new IntelligentTelegramUserBot();
    await bot.initialize();
    
    global.bot = bot; // Store reference for shutdown
    return bot;
  }
};`;
    }

    await fs.writeFile('telegram-userbot-gui/src/bot/intelligent-telegram-userbot.js', botContent);
    console.log(`${colors.green}✓ Copied and modified bot file${colors.reset}`);

    // Step 11: Install dependencies
    console.log(`\n${colors.cyan}Step 11: Installing dependencies (this may take a few minutes)...${colors.reset}`);
    process.chdir('telegram-userbot-gui');
    
    try {
      const { stdout, stderr } = await execPromise('npm install');
      console.log(`${colors.green}✓ Dependencies installed successfully${colors.reset}`);
      if (stderr) {
        console.log(`${colors.yellow}Warnings: ${stderr}${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error installing dependencies: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}You may need to run 'npm install' manually in the telegram-userbot-gui directory${colors.reset}`);
    }

    // Step 12: Build the application
    console.log(`\n${colors.cyan}Step 12: Building the application...${colors.reset}`);
    try {
      await execPromise('npm run build');
      console.log(`${colors.green}✓ Application built successfully${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error building application: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}You may need to run 'npm run build' manually${colors.reset}`);
    }

    // Success message
    console.log(`\n${colors.bright}${colors.green}
╔════════════════════════════════════════════════════════════╗
║                  ✅ SETUP COMPLETE! ✅                     ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}Your Telegram UserBot GUI is ready to use!${colors.reset}

${colors.yellow}To start the application:${colors.reset}
  cd telegram-userbot-gui
  npm start

${colors.yellow}For development mode with hot reload:${colors.reset}
  cd telegram-userbot-gui
  npm run dev

${colors.yellow}To create a distributable package:${colors.reset}
  cd telegram-userbot-gui
  npm run dist

${colors.magenta}Happy botting! 🤖${colors.reset}
`);

  } catch (error) {
    console.error(`${colors.red}Setup failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  setup();
}

module.exports = setup;
import React from 'react';
import ReactDOM from 'react-dom/client';
import SetupWizard from '../components/SetupWizard';

// Create electron API bridge
window.electron = {
  saveConfig: (config) => window.require('electron').ipcRenderer.invoke('save-config', config),
  startBot: () => window.require('electron').ipcRenderer.invoke('start-bot')
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SetupWizard />);
#!/usr/bin/env node

// patch-service-simulator.js - Simple patch service for testing
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// In-memory storage for patches
const patches = new Map();

// Patch statuses progression
const statusProgression = [
  'received',
  'validating',
  'testing',
  'ready',
  'deploying',
  'deployed'
];

// API Routes
app.post('/api/patches', (req, res) => {
  const { requestId, target, description, requestedBy, autoApproved } = req.body;
  
  const patch = {
    requestId,
    target,
    description,
    requestedBy,
    status: 'validating',
    autoApproved,
    createdAt: new Date().toISOString(),
    progress: 10,
    logs: [`Patch request received from ${requestedBy}`],
    affectedSystems: generateAffectedSystems(target),
    estimatedTime: '10-15 minutes',
    risk: calculateRisk(target, description)
  };
  
  patches.set(requestId, patch);
  
  // Simulate patch progression
  simulatePatchProgress(requestId);
  
  res.json({
    success: true,
    requestId,
    status: patch.status,
    message: `Patch request received and being validated`,
    estimatedTime: patch.estimatedTime,
    affectedSystems: patch.affectedSystems,
    risk: patch.risk
  });
});

app.get('/api/patches/:requestId', (req, res) => {
  const patch = patches.get(req.params.requestId);
  
  if (!patch) {
    return res.status(404).json({
      success: false,
      error: 'Patch request not found'
    });
  }
  
  res.json({
    success: true,
    ...patch,
    currentStatus: patch.status,
    logs: patch.logs.slice(-5) // Last 5 log entries
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', patches: patches.size });
});

// Helper functions
function generateAffectedSystems(target) {
  const systems = {
    'api': ['API Gateway', 'Load Balancer', 'Cache Layer'],
    'database': ['Primary DB', 'Read Replicas', 'Backup System'],
    'auth': ['Auth Service', 'Session Store', 'User Service'],
    'frontend': ['CDN', 'Static Assets', 'Web Servers'],
    'backend': ['Application Servers', 'Message Queue', 'Worker Nodes']
  };
  
  const targetLower = target.toLowerCase();
  for (const [key, value] of Object.entries(systems)) {
    if (targetLower.includes(key)) {
      return value;
    }
  }
  
  return ['Application Core', 'Service Layer'];
}

function calculateRisk(target, description) {
  const highRiskKeywords = ['security', 'auth', 'database', 'payment', 'critical'];
  const mediumRiskKeywords = ['api', 'cache', 'performance', 'update'];
  
  const combined = `${target} ${description}`.toLowerCase();
  
  if (highRiskKeywords.some(keyword => combined.includes(keyword))) {
    return 'high';
  }
  if (mediumRiskKeywords.some(keyword => combined.includes(keyword))) {
    return 'medium';
  }
  return 'low';
}

function simulatePatchProgress(requestId) {
  const patch = patches.get(requestId);
  if (!patch) return;
  
  let currentStatusIndex = 1;
  
  const interval = setInterval(() => {
    if (currentStatusIndex >= statusProgression.length) {
      clearInterval(interval);
      return;
    }
    
    patch.status = statusProgression[currentStatusIndex];
    patch.progress = Math.min(100, (currentStatusIndex + 1) * 20);
    patch.logs.push(`Status changed to: ${patch.status}`);
    
    // Add specific logs based on status
    switch (patch.status) {
      case 'validating':
        patch.logs.push('Running dependency checks...');
        break;
      case 'testing':
        patch.logs.push('Executing test suite...');
        patch.logs.push('All tests passed ✓');
        break;
      case 'ready':
        patch.logs.push('Patch validated and ready for deployment');
        break;
      case 'deploying':
        patch.logs.push('Rolling out to production servers...');
        break;
      case 'deployed':
        patch.logs.push('Patch successfully deployed!');
        patch.completedAt = new Date().toISOString();
        break;
    }
    
    currentStatusIndex++;
  }, 5000); // Progress every 5 seconds
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         📡 PATCH SERVICE SIMULATOR RUNNING 📡              ║
╚════════════════════════════════════════════════════════════╝

  Port: ${PORT}
  Endpoint: http://localhost:${PORT}/api/patches
  Health: http://localhost:${PORT}/health

  This simulator will:
  • Accept patch requests
  • Simulate validation and deployment
  • Progress through status changes
  • Provide realistic responses

  Press Ctrl+C to stop
`);
});
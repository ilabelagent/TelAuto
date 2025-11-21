# 🤖 TelAuto - Intelligent Telegram Bot with Ollama

Self-learning Telegram bot powered by Ollama (local LLM) with multi-cloud deployment options. This module operates as a standalone service within the larger **Valifi Kingdom Platform**.

---

## ✨ Features

- 🧠 **Self-Learning AI** - Learns from conversations and improves over time
- 🦙 **Ollama Integration** - Runs Llama2, Mistral, or any Ollama model locally
- 🎭 **Adaptive Personality** - Adjusts tone and style based on feedback
- 💾 **Learning Database** - Stores patterns, context, and conversation history
- ⚡ **Multi-Platform** - Deploy to AWS, GCP, Render, or run locally
- 🔐 **Secure** - Uses Secrets Manager for credentials
- 📊 **Analytics** - Tracks performance and learning metrics

## Integration with Valifi Kingdom Platform

This module is designed to integrate seamlessly with the main Valifi Kingdom Platform, leveraging shared services for memory management and service discovery.

*   **Unified Memory:** Utilizes the `UnifiedMemoryBridge` for persistent learning and context sharing, specifically for chat logs and learned patterns.
*   **Module Interface:** Adheres to the `ModuleInterface` contract for standardized lifecycle management and communication within the platform.
*   **Service Registry:** Registers with the central `ServiceRegistry` for dynamic discovery and health monitoring by the main platform orchestrator.

---

## 🚀 Quick Start

### Option 1: AWS App Runner (~$50/month)
```bash
cd deployment-configs
deploy-apprunner.bat  # Windows
./deploy-apprunner.sh # Mac/Linux
```

### Option 2: Google Cloud Run (~$150/month)
```bash
cd deployment-configs
auto-deploy-cloudrun.bat  # Windows
./auto-deploy-cloudrun.sh # Mac/Linux
```

### Option 3: Render (~$25/month) ⭐ CHEAPEST
1. Push this repo to GitHub
2. Connect to Render.com
3. Uses `render.yaml` automatically
4. Deploy!

### Option 4: Run Locally (FREE)
```bash
cd telbot
npm install
node intelligent-telegram-userbot.js
```

---

## 📋 Prerequisites

### For All Deployments:
- Telegram API credentials (from https://my.telegram.org)
  - API ID
  - API Hash
  - Phone number

### For AWS:
- AWS CLI installed
- AWS account with billing enabled
- Docker Desktop

### For GCP:
- Google Cloud SDK installed
- GCP project with billing enabled
- Docker Desktop

### For Render:
- GitHub account
- Render account (free to sign up)

### For Local:
- Node.js 18+
- Ollama installed (https://ollama.com)

---

## 💰 Cost Comparison

| Platform | Monthly Cost | Setup Time | Complexity |
|----------|--------------|------------|------------|
| **Render** | $25 | 10 min | ⭐ Easy |
| **AWS App Runner** | $50 | 30 min | ⭐⭐⭐ Medium |
| **Google Cloud Run** | $150 | 30 min | ⭐⭐⭐ Medium |
| **Local (PC)** | FREE | 5 min | ⭐ Easy |

---

## 📁 Project Structure

```
.
├── telbot/                          # Main bot code
│   ├── intelligent-telegram-userbot.js  # Core bot logic
│   ├── package.json                 # Dependencies
│   └── node_modules/                # Installed packages
├── deployment-configs/              # Multi-cloud deployment
│   ├── Dockerfile                   # Container configuration
│   ├── render.yaml                  # Render deployment
│   ├── deploy-apprunner.bat         # AWS deployment (Windows)
│   ├── auto-deploy-cloudrun.bat     # GCP deployment (Windows)
│   ├── AWS_APPRUNNER_GUIDE.md       # AWS documentation
│   ├── CLOUDRUN_GUIDE.md            # GCP documentation
│   └── DEPLOYMENT_SUMMARY.md        # Platform comparison
└── README.md                        # This file
```

---

## 🛠️ Configuration

### Environment Variables:

```bash
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE=+1234567890
OLLAMA_MODEL=llama2  # or mistral, codellama, etc.
```

### Supported Ollama Models:

- `llama2` - Meta's Llama 2 (7B, 13B, 70B)
- `mistral` - Mistral AI's model (faster than Llama2)
- `codellama` - Code-focused model
- `tinyllama` - Smallest/fastest option

Full list: https://ollama.com/library

---

## 📚 Documentation

Detailed guides in `deployment-configs/`:

- **AWS_APPRUNNER_GUIDE.md** - Complete AWS deployment guide
- **CLOUDRUN_GUIDE.md** - Complete GCP deployment guide  
- **DEPLOYMENT_SUMMARY.md** - Platform comparison and recommendations
- **AUTOMATED_DEPLOYMENT.md** - GCP automated deployment
- **QUICKSTART_AWS.md** - 5-minute AWS guide
- **[Platform Overview](../../README.md)** - Overview of the Valifi Kingdom Platform

---

## 🔧 Advanced Configuration

### Change Personality:

Edit `telbot/intelligent-telegram-userbot.js`:

```javascript
personality: {
  name: 'Your Bot Name',
  style: 'adaptive',
  traits: {
    professional: 0.8,  // 0-1 scale
    friendly: 0.7,
    humorous: 0.3,
    formal: 0.5,
    empathetic: 0.9
  }
}
```

### Enable Learning:

```javascript
learning: {
  enabled: true,
  autoLearn: true,
  requireApproval: false,  // Auto-learn without approval
  improvementThreshold: 0.7,
  maxMemorySize: 1000
}
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - see LICENSE file for details

---

## ⚠️ Security

**NEVER commit:**
- Service account keys (*.json)
- API credentials (.env files)
- Session files (*.session)
- Learning data with personal information

The `.gitignore` file protects these automatically.

---

## 🆘 Support

**Issues?** Check the guides in `deployment-configs/`

**Still stuck?**
- AWS: https://docs.aws.amazon.com/apprunner/
- GCP: https://cloud.google.com/run/docs
- Render: https://render.com/docs
- Ollama: https://ollama.com/library

---

## 🎯 Roadmap

- [ ] Discord bot integration
- [ ] WhatsApp bot support
- [ ] Slack integration
- [ ] Multi-language support
- [ ] Voice message handling
- [ ] Image generation with Stable Diffusion
- [ ] Advanced memory management
- [ ] Conversation analytics dashboard

---

## 📊 Architecture

```
Telegram <-> Bot Logic <-> Ollama (LLM) <-> Learning System
                ↓
         Cloud Storage
      (conversation history)
```

**Components:**
- Telegram API for messaging
- Ollama for AI responses
- Learning system for improvement
- Cloud storage for persistence

---

## 🌟 Star History

If you find this useful, please ⭐ star the repo!

---

**Built with ❤️ using Ollama, Node.js, and modern cloud platforms**
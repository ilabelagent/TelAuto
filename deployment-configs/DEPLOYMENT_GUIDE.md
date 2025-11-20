# 🚀 Multi-Platform Deployment Guide
## Telegram Bot + Ollama Hosting

---

## 📊 Quick Comparison

| Platform | Setup Time | Monthly Cost | Difficulty | Ollama Support |
|----------|------------|--------------|------------|----------------|
| **Render** | 10 min | $25 | ⭐ Easy | ✅ Perfect |
| **GCP Cloud Run** | 30 min | $30-50 | ⭐⭐⭐ Medium | ✅ Good |
| **AWS App Runner** | 45 min | $40-60 | ⭐⭐⭐⭐ Hard | ⚠️ Limited |
| **Vercel** | N/A | N/A | N/A | ❌ Not Supported |

---

## 🥇 OPTION 1: Render (RECOMMENDED)

### Why Render?
- ✅ Native Docker support for Ollama
- ✅ Persistent disk for learning data
- ✅ Simple pricing ($25/mo for 2GB RAM)
- ✅ Auto-deploy from GitHub
- ✅ Zero DevOps knowledge needed

### Setup Steps:

#### 1. Prepare Repository
```bash
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 2. Deploy on Render
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Render auto-detects `render.yaml`
5. Set environment variables in dashboard:
   - `TELEGRAM_API_ID`
   - `TELEGRAM_API_HASH`
   - `TELEGRAM_PHONE`
6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment

#### 3. Verify Deployment
```bash
# Check logs in Render dashboard
# Look for: "✅ Telegram bot started successfully"
```

### Cost Breakdown (Render):
- **Starter Plan:** $7/mo (1GB RAM) - Too small for Ollama
- **Standard Plan:** $25/mo (2GB RAM) - ✅ **RECOMMENDED**
- **Pro Plan:** $85/mo (4GB RAM) - For larger models

---

## 🌐 OPTION 2: Google Cloud Platform (GCP)

### Why GCP?
- ✅ Enterprise-grade infrastructure
- ✅ Pay-per-use pricing
- ✅ Global CDN and auto-scaling
- ✅ Good for production workloads
- ⚠️ More complex setup

### Setup Steps:

#### 1. Install Google Cloud CLI
```bash
# Windows
choco install gcloudsdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

#### 2. Initialize GCP Project
```bash
# Login to GCP
gcloud auth login

# Create new project (or use existing)
gcloud projects create telegram-bot-project --name="Telegram Bot"

# Set project
gcloud config set project telegram-bot-project

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

#### 3. Store Secrets
```bash
# Store Telegram credentials securely
echo -n "YOUR_API_ID" | gcloud secrets create telegram-api-id --data-file=-
echo -n "YOUR_API_HASH" | gcloud secrets create telegram-api-hash --data-file=-
echo -n "YOUR_PHONE" | gcloud secrets create telegram-phone --data-file=-
```

#### 4. Build and Push Docker Image
```bash
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system

# Build image
docker build -f deployment-configs/Dockerfile -t telegram-bot-ollama .

# Tag for GCP
docker tag telegram-bot-ollama gcr.io/telegram-bot-project/telegram-bot-ollama:latest

# Push to Google Container Registry
docker push gcr.io/telegram-bot-project/telegram-bot-ollama:latest
```

#### 5. Deploy to Cloud Run
```bash
gcloud run deploy telegram-bot-ollama \
  --image gcr.io/telegram-bot-project/telegram-bot-ollama:latest \
  --platform managed \
  --region us-central1 \
  --memory 4Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 1 \
  --no-allow-unauthenticated \
  --set-secrets="TELEGRAM_API_ID=telegram-api-id:latest,TELEGRAM_API_HASH=telegram-api-hash:latest,TELEGRAM_PHONE=telegram-phone:latest" \
  --set-env-vars="OLLAMA_MODEL=llama2"
```

#### 6. Verify Deployment
```bash
# Check service status
gcloud run services describe telegram-bot-ollama --region us-central1

# View logs
gcloud run services logs read telegram-bot-ollama --region us-central1

# Get service URL (though bot doesn't need external access)
gcloud run services describe telegram-bot-ollama --region us-central1 --format="value(status.url)"
```

### Cloud Run Cost Breakdown:

**Pricing Components:**
- **CPU:** $0.00002400/vCPU-second (2 vCPU = $4.15/day if always on)
- **Memory:** $0.00000250/GB-second (4GB = $0.86/day if always on)
- **Always-on instance:** ~$150/month for 4GB/2CPU

**Cost Optimization Tips:**
```bash
# Use minimum instances = 1 (always on for Telegram bot)
--min-instances 1

# Use smaller instance for lighter models
--memory 2Gi --cpu 1  # ~$75/month

# Use preemptible instances (not recommended for bots)
--execution-environment gen2
```

**Monthly Estimate:**
- **Small (2GB/1CPU):** ~$75/month
- **Medium (4GB/2CPU):** ~$150/month ✅ **RECOMMENDED**
- **Large (8GB/4CPU):** ~$300/month

### Cloud Run Advantages:

✅ **Auto-scaling:** Handles traffic spikes automatically  
✅ **Global reach:** Deploy to 35+ regions worldwide  
✅ **Integrated monitoring:** Built-in Cloud Logging & Monitoring  
✅ **VPC support:** Private networking for security  
✅ **CI/CD friendly:** Integrates with Cloud Build  

### Cloud Run Limitations:

⚠️ **No persistent disk:** Use Cloud Storage for learning data  
⚠️ **15-minute timeout:** Not ideal for very long operations  
⚠️ **Cold starts:** Can take 10-30 seconds (mitigated with min-instances=1)  
⚠️ **Cost:** More expensive than Render for always-on services  

---

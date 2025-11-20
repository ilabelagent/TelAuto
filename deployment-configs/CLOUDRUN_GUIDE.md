# ☁️ Google Cloud Run - Complete Deployment Guide
## Telegram Bot + Ollama on Cloud Run

---

## 📋 Table of Contents
1. [Why Cloud Run?](#why-cloud-run)
2. [Prerequisites](#prerequisites)
3. [Quick Start (5 Steps)](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [Cost Analysis](#cost-analysis)
6. [Monitoring & Debugging](#monitoring)
7. [Best Practices](#best-practices)

---

## 🤔 Why Cloud Run?

### ✅ Advantages:
- **Enterprise-grade:** Google's infrastructure, 99.95% SLA
- **Auto-scaling:** 0 to 1000+ instances automatically
- **Pay-per-use:** Only pay when bot is processing
- **Global:** Deploy to 35+ regions worldwide
- **Integrated:** Works with GCP ecosystem (Cloud Storage, Secret Manager, etc.)
- **Docker native:** Full control over environment
- **CI/CD friendly:** Integrates with Cloud Build, GitHub Actions

### ⚠️ Considerations:
- **No persistent disk:** Must use Cloud Storage for learning data
- **Cold starts:** ~10-30s if min-instances=0 (fixed with min-instances=1)
- **Cost:** $75-150/month for always-on (vs Render $25/month)
- **Complexity:** More setup than Render
- **15-min timeout:** Not ideal for extremely long operations

### 🆚 Cloud Run vs Competitors:

| Feature | Cloud Run | Render | AWS App Runner |
|---------|-----------|--------|----------------|
| Setup Time | 30 min | 10 min | 45 min |
| Monthly Cost | $75-150 | $25 | $40-60 |
| Ollama Support | ✅ Excellent | ✅ Excellent | ⚠️ Limited |
| Persistent Storage | Cloud Storage | Built-in disk | EFS/S3 |
| Auto-scaling | ✅ Excellent | ⚠️ Manual | ✅ Good |
| Global CDN | ✅ Yes | ❌ No | ⚠️ Limited |
| Monitoring | ✅ Built-in | ✅ Built-in | ✅ CloudWatch |

---

## 📦 Prerequisites

### 1. Install Google Cloud SDK
```bash
# Windows (using Chocolatey)
choco install gcloudsdk

# Or download installer from:
# https://cloud.google.com/sdk/docs/install
```

### 2. Install Docker Desktop
```bash
# Download from: https://www.docker.com/products/docker-desktop
```

### 3. Have Ready:
- Google Cloud account (free tier available)
- Telegram API credentials (get from https://my.telegram.org)
- Credit card (for GCP billing, though free tier covers initial testing)

---

## ⚡ Quick Start (5 Steps)

### Step 1: Initialize GCP
```bash
# Login
gcloud auth login

# Create project
gcloud projects create telegram-bot-$(date +%s) --name="Telegram Bot"

# Set as active project (replace with your project ID)
gcloud config set project telegram-bot-XXXXXXXXXX

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com
```

### Step 2: Store Secrets
```bash
# Store Telegram credentials
echo -n "YOUR_API_ID" | gcloud secrets create telegram-api-id --data-file=-
echo -n "YOUR_API_HASH" | gcloud secrets create telegram-api-hash --data-file=-
echo -n "YOUR_PHONE_NUMBER" | gcloud secrets create telegram-phone --data-file=-

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe telegram-bot-XXXXXXXXXX --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding telegram-api-id \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding telegram-api-hash \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding telegram-phone \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Build & Push Docker Image
```bash
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system

# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Build image
docker build -f deployment-configs/Dockerfile -t telegram-bot-ollama .

# Tag for GCR
docker tag telegram-bot-ollama gcr.io/$PROJECT_ID/telegram-bot-ollama:latest

# Configure Docker to use gcloud
gcloud auth configure-docker

# Push to registry
docker push gcr.io/$PROJECT_ID/telegram-bot-ollama:latest
```

### Step 4: Create Cloud Storage Bucket (for learning data)
```bash
# Create bucket for persistent data
gsutil mb -p $PROJECT_ID -c STANDARD -l US gs://${PROJECT_ID}-bot-data

# Grant Cloud Run access
gsutil iam ch serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com:objectAdmin \
  gs://${PROJECT_ID}-bot-data
```

### Step 5: Deploy to Cloud Run
```bash
gcloud run deploy telegram-bot-ollama \
  --image gcr.io/$PROJECT_ID/telegram-bot-ollama:latest \
  --platform managed \
  --region us-central1 \
  --memory 4Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 1 \
  --timeout 3600 \
  --no-allow-unauthenticated \
  --set-secrets="TELEGRAM_API_ID=telegram-api-id:latest,TELEGRAM_API_HASH=telegram-api-hash:latest,TELEGRAM_PHONE=telegram-phone:latest" \
  --set-env-vars="OLLAMA_MODEL=llama2,GCS_BUCKET=${PROJECT_ID}-bot-data"
```

**✅ Done!** Your bot is now live on Cloud Run.

---

## 💰 Cost Analysis

### Pricing Components:

**1. Cloud Run Compute:**
- **CPU:** $0.00002400 per vCPU-second
- **Memory:** $0.00000250 per GB-second
- **Requests:** $0.40 per million requests (free for Telegram bot)

**2. Cloud Storage (Learning Data):**
- **Storage:** $0.020 per GB/month (~$0.02 for small datasets)
- **Operations:** Negligible for bot use case

**3. Container Registry:**
- **Storage:** $0.026 per GB/month (~$0.05 for Docker image)

### Monthly Cost Estimates:

#### Configuration 1: Small (2GB RAM / 1 CPU) - Always On
```
CPU: 1 vCPU × 2,592,000 seconds/month × $0.000024 = $62.21/month
RAM: 2 GB × 2,592,000 seconds/month × $0.0000025 = $12.96/month
Storage: ~$0.05/month
Total: ~$75/month
```

#### Configuration 2: Medium (4GB RAM / 2 CPU) - Always On ✅ RECOMMENDED
```
CPU: 2 vCPU × 2,592,000 seconds/month × $0.000024 = $124.42/month
RAM: 4 GB × 2,592,000 seconds/month × $0.0000025 = $25.92/month  
Storage: ~$0.05/month
Total: ~$150/month
```

#### Configuration 3: Large (8GB RAM / 4 CPU) - Always On
```
CPU: 4 vCPU × 2,592,000 seconds/month × $0.000024 = $248.83/month
RAM: 8 GB × 2,592,000 seconds/month × $0.0000025 = $51.84/month
Storage: ~$0.05/month
Total: ~$300/month  
```

### Cost Optimization Tips:

**1. Use min-instances wisely:**
```bash
# Always-on (no cold starts, but constant billing)
--min-instances 1

# Scale to zero (saves money, but 10-30s cold start)
--min-instances 0 --max-instances 1
```

**2. Choose right region:**
- **us-central1:** Cheapest ($)
- **us-east1:** Also cheap ($)
- **europe-west1:** Moderate ($$)
- **asia-east1:** More expensive ($$$)

**3. Use smaller models when possible:**
- **llama2:7b** - 4GB RAM sufficient
- **mistral:7b** - 4GB RAM sufficient  
- **llama2:13b** - 8GB RAM needed
- **codellama:34b** - 16GB RAM needed (expensive!)

---

## 📈 Monitoring & Debugging

### View Logs:
```bash
# Real-time logs
gcloud run services logs tail telegram-bot-ollama --region us-central1

# Recent logs
gcloud run services logs read telegram-bot-ollama --region us-central1 --limit 100

# Filter logs
gcloud run services logs read telegram-bot-ollama \
  --region us-central1 \
  --filter="severity=ERROR"
```

### Check Service Status:
```bash
# Service details
gcloud run services describe telegram-bot-ollama --region us-central1

# List all revisions
gcloud run revisions list --service telegram-bot-ollama --region us-central1

# Check metrics
gcloud monitoring dashboards create --config-from-file=dashboard.json
```

### Common Issues & Solutions:

#### ❌ Issue: "Container failed to start"
```bash
# Solution: Check logs for errors
gcloud run services logs read telegram-bot-ollama --region us-central1 --limit 50

# Common causes:
# - Ollama model too large for memory
# - Missing environment variables
# - Telegram API credentials incorrect
```

#### ❌ Issue: "Memory limit exceeded"
```bash
# Solution: Increase memory
gcloud run services update telegram-bot-ollama \
  --memory 8Gi \
  --region us-central1
```

#### ❌ Issue: "Cold starts taking too long"
```bash
# Solution: Set min-instances to 1
gcloud run services update telegram-bot-ollama \
  --min-instances 1 \
  --region us-central1
```

#### ❌ Issue: "Can't access Cloud Storage"
```bash
# Solution: Grant permissions
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gsutil iam ch serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com:objectAdmin \
  gs://YOUR-BUCKET-NAME
```

---

## ✨ Best Practices

### 1. Security:
```bash
# Use Secret Manager (never hardcode credentials)
gcloud secrets create my-secret --data-file=secret.txt

# Principle of least privilege
# Don't use default compute service account
gcloud iam service-accounts create telegram-bot-sa --display-name="Telegram Bot"

# Grant only needed permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:telegram-bot-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Deploy with custom service account
gcloud run deploy telegram-bot-ollama \
  --service-account telegram-bot-sa@$PROJECT_ID.iam.gserviceaccount.com
```

### 2. Reliability:
```bash
# Always set health checks
# Add to your start.sh:
while true; do
  echo "Health check OK" > /tmp/health
  sleep 60
done &

# Set proper timeout (Telegram bot needs long timeout)
--timeout 3600  # 1 hour

# Enable graceful shutdown
trap 'kill -TERM $PID' TERM INT
node intelligent-telegram-userbot.js &
PID=$!
wait $PID
```

### 3. Performance:
```bash
# Use appropriate CPU allocation
--cpu-throttling  # Default: CPU only during requests (not good for always-on bots)
--no-cpu-throttling  # CPU always available (better for bots)

# Optimize Docker image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Use multi-stage builds
FROM node:20-slim AS builder
# ... build steps
FROM node:20-slim
COPY --from=builder /app /app
```

### 4. Monitoring:
```bash
# Set up alerts
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL \
  --display-name="Bot CPU High" \
  --condition-display-name="CPU > 80%" \
  --condition-threshold-value=0.8

# Enable Cloud Logging
# (automatically enabled for Cloud Run)

# Export logs to BigQuery for analysis
gcloud logging sinks create bot-logs \
  bigquery.googleapis.com/projects/$PROJECT_ID/datasets/bot_logs
```

### 5. Continuous Deployment:
```yaml
# .github/workflows/deploy-cloudrun.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/telegram-bot
          gcloud run deploy telegram-bot --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/telegram-bot
```

---

## 🏁 Final Verdict: Should You Use Cloud Run?

### ✅ Use Cloud Run If:
- You need **enterprise-grade reliability** (99.95% SLA)
- You want **auto-scaling** capabilities
- You're already using **GCP ecosystem**
- You need **global deployment** (multiple regions)
- You have **budget of $150+/month**
- You want **advanced monitoring** and logging
- You need **VPC/private networking**

### ❌ Don't Use Cloud Run If:
- You want **simplest setup** → Use **Render** instead
- You have **tight budget** (<$50/month) → Use **Render** ($25/mo)
- You're **new to cloud** → Start with **Render**
- You need **true persistent disk** → Use **Render** or **GCE**

---

## 📊 Cloud Run vs Render: Side-by-Side

| Factor | Cloud Run | Render |
|--------|-----------|--------|
| **Setup Time** | 30 minutes | 10 minutes |
| **Cost (4GB/2CPU)** | ~$150/month | $25/month |
| **Deployment** | CLI + Docker | Git push |
| **Persistent Storage** | Cloud Storage (complex) | Built-in disk (simple) |
| **Scalability** | Excellent (0-1000+) | Manual scaling |
| **Monitoring** | Advanced (Cloud Logging) | Basic (built-in) |
| **Best For** | Production/Enterprise | Indie/Startups |

---

## 🚀 Next Steps

**For Cloud Run:**
1. Run the quick start commands above
2. Test with `deploy-cloudrun.sh` script
3. Monitor logs for first 24 hours
4. Optimize based on metrics

**For Simpler Alternative:**
1. Check out `render.yaml` configuration
2. Push to GitHub
3. Connect to Render
4. Deploy in 10 minutes

---

**Need Help?** Check:
- Cloud Run Docs: https://cloud.google.com/run/docs
- Troubleshooting: https://cloud.google.com/run/docs/troubleshooting
- Pricing Calculator: https://cloud.google.com/products/calculator

# 🤖 Automated Cloud Run Deployment
## Using Your Service Account: ilabeliman

---

## ⚡ Quick Start (1 Command!)

### Windows:
```cmd
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system\deployment-configs
auto-deploy-cloudrun.bat
```

### Mac/Linux:
```bash
cd /path/to/ai-chat-system/deployment-configs
chmod +x auto-deploy-cloudrun.sh
./auto-deploy-cloudrun.sh
```

That's it! The script will:
✅ Authenticate with your service account
✅ Enable all required APIs
✅ Create secrets (will prompt you)
✅ Create Cloud Storage bucket
✅ Build Docker image
✅ Push to Google Container Registry
✅ Deploy to Cloud Run

---

## 📝 Prerequisites

### 1. Install Google Cloud SDK

**Windows:**
```cmd
choco install gcloudsdk
```
Or download from: https://cloud.google.com/sdk/docs/install

**Mac:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Install Docker Desktop

Download from: https://www.docker.com/products/docker-desktop

### 3. Get Telegram API Credentials

1. Go to https://my.telegram.org
2. Login with your phone number
3. Click "API development tools"
4. Create a new application
5. Save your:
   - **API ID** (numeric)
   - **API Hash** (alphanumeric string)
   - **Phone Number** (with country code, e.g., +12345678900)

The deployment script will ask for these values.

---

## 🔑 Service Account Details

**Project:** `ilabeliman`
**Service Account:** `125147408759-compute@developer.gserviceaccount.com`
**Key File:** `ilabeliman-6dace734925e.json`

✅ Already configured and ready to use!

---

## 🚀 Deployment Process

### What the Script Does:

**Step 1:** Authenticates with your service account
- Uses `ilabeliman-6dace734925e.json`
- Sets project to `ilabeliman`

**Step 2:** Enables Required APIs
- Cloud Run API
- Container Registry API
- Secret Manager API
- Cloud Storage API
- Cloud Build API

**Step 3:** Creates Secrets
- `telegram-api-id`
- `telegram-api-hash`
- `telegram-phone`

**Step 4:** Grants Secret Access
- Allows Cloud Run service to read secrets

**Step 5:** Creates Cloud Storage Bucket
- Bucket name: `ilabeliman-bot-data`
- Used for persistent learning data

**Step 6-7:** Builds & Tags Docker Image
- Includes Ollama + Node.js + Telegram bot
- Tags for Google Container Registry

**Step 8-9:** Pushes to GCR
- May take 5-10 minutes
- Image stored at `gcr.io/ilabeliman/telegram-bot-ollama`

**Step 10:** Deploys to Cloud Run
- **Memory:** 4GB
- **CPU:** 2 cores
- **Min Instances:** 1 (always-on, no cold starts)
- **Max Instances:** 1
- **Timeout:** 3600 seconds (1 hour)
- **Region:** us-central1

---

## 💰 Cost Estimate

### Monthly Cost Breakdown:

**Cloud Run Compute:**
- 2 vCPU × 2,592,000 sec/month × $0.000024 = **$124.42**
- 4 GB RAM × 2,592,000 sec/month × $0.0000025 = **$25.92**

**Cloud Storage:**
- Storage: ~$0.02/month
- Operations: Negligible

**Container Registry:**
- ~$0.05/month

**Total: ~$150/month**

⚠️ **This is an always-on service** (min-instances=1)
- No cold starts
- Telegram bot always responsive
- Consistent billing

---

## 📊 After Deployment

### View Logs:
```bash
gcloud run services logs tail telegram-bot-ollama --region us-central1
```

### Check Service Status:
```bash
gcloud run services describe telegram-bot-ollama --region us-central1
```

### Update Service:
```bash
# To change memory/CPU:
gcloud run services update telegram-bot-ollama \
  --memory 8Gi \
  --cpu 4 \
  --region us-central1

# To change Ollama model:
gcloud run services update telegram-bot-ollama \
  --set-env-vars="OLLAMA_MODEL=mistral" \
  --region us-central1
```

### Stop Service (to save money):
```bash
# Set min-instances to 0 (will have cold starts)
gcloud run services update telegram-bot-ollama \
  --min-instances 0 \
  --region us-central1

# Or delete entirely:
gcloud run services delete telegram-bot-ollama --region us-central1
```

---

## 🔧 Troubleshooting

### Issue: "Permission denied" errors
**Solution:**
```bash
# Re-authenticate
gcloud auth login
gcloud auth activate-service-account --key-file=../ilabeliman-6dace734925e.json
```

### Issue: Docker build fails
**Solution:**
```bash
# Make sure Docker Desktop is running
# Check Docker status:
docker ps

# If Docker not running, start Docker Desktop
```

### Issue: "Insufficient memory" on Cloud Run
**Solution:**
```bash
# Increase memory allocation:
gcloud run services update telegram-bot-ollama \
  --memory 8Gi \
  --region us-central1

# This will cost more (~$300/month)
```

### Issue: Bot not responding
**Solution:**
```bash
# Check logs for errors:
gcloud run services logs tail telegram-bot-ollama --region us-central1

# Look for:
# - Telegram authentication errors
# - Ollama model loading issues
# - API connection problems
```

### Issue: "Quota exceeded" errors
**Solution:**
1. Go to GCP Console: https://console.cloud.google.com
2. Navigate to "IAM & Admin" → "Quotas"
3. Search for the quota that's exceeded
4. Request increase

---

## 🔒 Security Best Practices

### 1. Protect Your Service Account Key
```bash
# NEVER commit this to git!
# Add to .gitignore:
echo "ilabeliman-6dace734925e.json" >> .gitignore

# Keep it secure on your local machine
# Don't share it publicly
```

### 2. Rotate Secrets Periodically
```bash
# Update a secret:
echo "NEW_VALUE" | gcloud secrets versions add telegram-api-id --data-file=-

# Cloud Run will automatically use the latest version
```

### 3. Monitor Access Logs
```bash
# View who accessed your service:
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

---

## 📊 Monitoring & Alerts

### Set Up Billing Alerts:
1. Go to: https://console.cloud.google.com/billing
2. Click on your billing account
3. "Budgets & alerts"
4. Create budget alert at $200/month

### Monitor Service Health:
```bash
# Check service metrics:
gcloud run services describe telegram-bot-ollama \
  --region us-central1 \
  --format="table(status.conditions[0].type,status.conditions[0].status)"

# View request count:
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"' \
  --format=json
```

---

## 🔄 Updating Your Bot

### After Code Changes:

**Quick Update (Rebuild & Redeploy):**
```bash
# Run the deployment script again
cd deployment-configs
auto-deploy-cloudrun.bat

# It will detect existing resources and update them
```

**Manual Update:**
```bash
# 1. Rebuild image
docker build -f deployment-configs/Dockerfile -t telegram-bot-ollama .

# 2. Tag
docker tag telegram-bot-ollama gcr.io/ilabeliman/telegram-bot-ollama:latest

# 3. Push
docker push gcr.io/ilabeliman/telegram-bot-ollama:latest

# 4. Deploy (Cloud Run auto-detects new image)
gcloud run deploy telegram-bot-ollama --region us-central1
```

---

## 🎯 Next Steps

### 1. Run the Deployment
```cmd
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system\deployment-configs
auto-deploy-cloudrun.bat
```

### 2. Monitor Initial Deployment
- Watch logs for Ollama model download (~5-10 minutes for llama2)
- Verify Telegram authentication
- Test bot with a message

### 3. Optimize Based on Usage
- If bot is slow: Increase memory/CPU
- If cost is high: Use smaller Ollama model (mistral:7b)
- If traffic is low: Consider min-instances=0

### 4. Add Monitoring
- Set up billing alerts
- Configure uptime checks
- Enable error reporting

---

## 📝 Quick Reference

### Essential Commands:

```bash
# Deploy
cd deployment-configs
auto-deploy-cloudrun.bat

# View logs (real-time)
gcloud run services logs tail telegram-bot-ollama --region us-central1

# Check status
gcloud run services describe telegram-bot-ollama --region us-central1

# Update config
gcloud run services update telegram-bot-ollama --memory 8Gi --region us-central1

# Stop (to save money)
gcloud run services update telegram-bot-ollama --min-instances 0 --region us-central1

# Delete everything
gcloud run services delete telegram-bot-ollama --region us-central1
gsutil rm -r gs://ilabeliman-bot-data
```

---

## ❓ Need Help?

**Documentation:**
- Cloud Run: https://cloud.google.com/run/docs
- Troubleshooting: https://cloud.google.com/run/docs/troubleshooting
- Pricing: https://cloud.google.com/run/pricing

**Support:**
- GCP Console: https://console.cloud.google.com
- Stack Overflow: https://stackoverflow.com/questions/tagged/google-cloud-run
- GCP Community: https://www.googlecloudcommunity.com

---

## ✅ Deployment Checklist

- [ ] Google Cloud SDK installed
- [ ] Docker Desktop installed and running
- [ ] Telegram API credentials ready
- [ ] Service account key file exists
- [ ] Billing enabled on GCP project
- [ ] Run `auto-deploy-cloudrun.bat`
- [ ] Monitor deployment logs
- [ ] Test bot with Telegram message
- [ ] Set up billing alerts
- [ ] Review monthly costs

---

**Ready to deploy? Run the script and let it handle everything!** 🚀

#!/bin/bash
# Automated Cloud Run Deployment Script
# Uses service account: ilabeliman-6dace734925e.json

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "   🚀 AUTOMATED CLOUD RUN DEPLOYMENT"
echo "   Project: peaceful-access-473817-v1"
echo "   Service: telegram-bot-ollama"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Configuration
PROJECT_ID="peaceful-access-473817-v1"
SERVICE_NAME="telegram-bot-ollama"
REGION="us-central1"
SERVICE_ACCOUNT_KEY="../peaceful-access-473817-v1-41aa6d82cbda.json"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Check if service account key exists
if [ ! -f "$SERVICE_ACCOUNT_KEY" ]; then
    echo -e "${RED}❌ Error: Service account key not found at $SERVICE_ACCOUNT_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Service account key found${NC}"

# Step 1: Authenticate with service account
echo -e "\n${YELLOW}Step 1/10: Authenticating with GCP...${NC}"
gcloud auth activate-service-account --key-file="$SERVICE_ACCOUNT_KEY"
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ Authenticated as: $(gcloud config get-value account)${NC}"

# Step 2: Enable required APIs
echo -e "\n${YELLOW}Step 2/10: Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    storage.googleapis.com \
    cloudbuild.googleapis.com \
    --quiet
echo -e "${GREEN}✅ APIs enabled${NC}"

# Step 3: Create secrets (if they don't exist)
echo -e "\n${YELLOW}Step 3/10: Setting up secrets...${NC}"

# Check if secrets exist, if not prompt for values
if ! gcloud secrets describe telegram-api-id --quiet 2>/dev/null; then
    echo -e "${BLUE}📝 Please enter your Telegram API ID:${NC}"
    read -r TELEGRAM_API_ID
    echo -n "$TELEGRAM_API_ID" | gcloud secrets create telegram-api-id --data-file=-
    echo -e "${GREEN}✅ Created telegram-api-id secret${NC}"
else
    echo -e "${GREEN}✅ telegram-api-id secret already exists${NC}"
fi

if ! gcloud secrets describe telegram-api-hash --quiet 2>/dev/null; then
    echo -e "${BLUE}📝 Please enter your Telegram API Hash:${NC}"
    read -r TELEGRAM_API_HASH
    echo -n "$TELEGRAM_API_HASH" | gcloud secrets create telegram-api-hash --data-file=-
    echo -e "${GREEN}✅ Created telegram-api-hash secret${NC}"
else
    echo -e "${GREEN}✅ telegram-api-hash secret already exists${NC}"
fi

if ! gcloud secrets describe telegram-phone --quiet 2>/dev/null; then
    echo -e "${BLUE}📝 Please enter your Telegram Phone Number:${NC}"
    read -r TELEGRAM_PHONE
    echo -n "$TELEGRAM_PHONE" | gcloud secrets create telegram-phone --data-file=-
    echo -e "${GREEN}✅ Created telegram-phone secret${NC}"
else
    echo -e "${GREEN}✅ telegram-phone secret already exists${NC}"
fi

# Step 4: Grant secret access to service account
echo -e "\n${YELLOW}Step 4/10: Granting secret access...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for secret in telegram-api-id telegram-api-hash telegram-phone; do
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet 2>/dev/null || true
done
echo -e "${GREEN}✅ Secret access granted to $SERVICE_ACCOUNT${NC}"

# Step 5: Create Cloud Storage bucket for learning data
echo -e "\n${YELLOW}Step 5/10: Creating Cloud Storage bucket...${NC}"
BUCKET_NAME="${PROJECT_ID}-bot-data"

if ! gsutil ls -b gs://$BUCKET_NAME 2>/dev/null; then
    gsutil mb -p $PROJECT_ID -c STANDARD -l US gs://$BUCKET_NAME
    echo -e "${GREEN}✅ Created bucket: gs://$BUCKET_NAME${NC}"
else
    echo -e "${GREEN}✅ Bucket already exists: gs://$BUCKET_NAME${NC}"
fi

# Grant bucket access to service account
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectAdmin gs://$BUCKET_NAME 2>/dev/null || true
echo -e "${GREEN}✅ Granted bucket access${NC}"

# Step 6: Build Docker image
echo -e "\n${YELLOW}Step 6/10: Building Docker image...${NC}"
cd ..
docker build -f deployment-configs/Dockerfile -t $SERVICE_NAME . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Step 7: Tag image for GCR
echo -e "\n${YELLOW}Step 7/10: Tagging image for Google Container Registry...${NC}"
docker tag $SERVICE_NAME $IMAGE_NAME:latest
echo -e "${GREEN}✅ Image tagged: $IMAGE_NAME:latest${NC}"

# Step 8: Configure Docker for GCP
echo -e "\n${YELLOW}Step 8/10: Configuring Docker authentication...${NC}"
gcloud auth configure-docker --quiet
echo -e "${GREEN}✅ Docker configured for GCP${NC}"

# Step 9: Push to GCR
echo -e "\n${YELLOW}Step 9/10: Pushing image to Google Container Registry...${NC}"
echo -e "${BLUE}This may take 5-10 minutes depending on your internet speed...${NC}"
docker push $IMAGE_NAME:latest || {
    echo -e "${RED}❌ Docker push failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Image pushed to GCR${NC}"

# Step 10: Deploy to Cloud Run
echo -e "\n${YELLOW}Step 10/10: Deploying to Cloud Run...${NC}"
echo -e "${BLUE}Configuration: 4GB RAM, 2 CPU, Always-on (min-instances=1)${NC}"

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --memory 4Gi \
    --cpu 2 \
    --min-instances 1 \
    --max-instances 1 \
    --timeout 3600 \
    --no-allow-unauthenticated \
    --set-secrets="TELEGRAM_API_ID=telegram-api-id:latest,TELEGRAM_API_HASH=telegram-api-hash:latest,TELEGRAM_PHONE=telegram-phone:latest" \
    --set-env-vars="OLLAMA_MODEL=llama2,GCS_BUCKET=$BUCKET_NAME" \
    --service-account=$SERVICE_ACCOUNT \
    --quiet

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}"
    echo "═══════════════════════════════════════════════════════════"
    echo "   ✅ DEPLOYMENT SUCCESSFUL!"
    echo "═══════════════════════════════════════════════════════════"
    echo -e "${NC}"
    
    echo -e "${BLUE}📋 Service Information:${NC}"
    gcloud run services describe $SERVICE_NAME --region $REGION --format="table(status.url,status.conditions[0].status)"
    
    echo -e "\n${BLUE}📊 View Logs:${NC}"
    echo "  gcloud run services logs tail $SERVICE_NAME --region $REGION"
    
    echo -e "\n${BLUE}🔧 Useful Commands:${NC}"
    echo "  Update service:  gcloud run services update $SERVICE_NAME --region $REGION"
    echo "  Delete service:  gcloud run services delete $SERVICE_NAME --region $REGION"
    echo "  View metrics:    gcloud run services describe $SERVICE_NAME --region $REGION"
    
    echo -e "\n${GREEN}💰 Monthly Cost Estimate: ~\$150 (4GB/2CPU always-on)${NC}"
    echo -e "${YELLOW}⚠️  Don't forget to monitor your billing!${NC}"
    
else
    echo -e "\n${RED}"
    echo "═══════════════════════════════════════════════════════════"
    echo "   ❌ DEPLOYMENT FAILED"
    echo "═══════════════════════════════════════════════════════════"
    echo -e "${NC}"
    echo -e "${YELLOW}Check logs for details:${NC}"
    echo "  gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
    exit 1
fi

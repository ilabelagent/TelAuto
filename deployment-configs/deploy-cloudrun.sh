#!/bin/bash
# Quick Cloud Run Deployment Script
# Usage: ./deploy-cloudrun.sh

set -e

echo "🚀 Cloud Run Deployment Script"
echo "================================"

# Configuration
PROJECT_ID="telegram-bot-project"  # Change this
SERVICE_NAME="telegram-bot-ollama"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1/6: Checking GCP authentication...${NC}"
gcloud auth list

echo -e "${YELLOW}Step 2/6: Setting project...${NC}"
gcloud config set project $PROJECT_ID

echo -e "${YELLOW}Step 3/6: Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com

echo -e "${YELLOW}Step 4/6: Building Docker image...${NC}"
cd ..
docker build -f deployment-configs/Dockerfile -t $SERVICE_NAME .

echo -e "${YELLOW}Step 5/6: Pushing to Google Container Registry...${NC}"
docker tag $SERVICE_NAME $IMAGE_NAME:latest
docker push $IMAGE_NAME:latest

echo -e "${YELLOW}Step 6/6: Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --memory 4Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 1 \
  --no-allow-unauthenticated \
  --set-env-vars="OLLAMA_MODEL=llama2" \
  --timeout 3600

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "View logs:"
echo "  gcloud run services logs read $SERVICE_NAME --region $REGION"
echo ""
echo "Service info:"
gcloud run services describe $SERVICE_NAME --region $REGION

# 🚀 AWS App Runner Deployment Guide
## Telegram Bot + Ollama on AWS

---

## ⚡ Quick Start (One Command)

### Windows:
```cmd
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system\deployment-configs
deploy-apprunner.bat
```

### Mac/Linux:
```bash
cd /path/to/ai-chat-system/deployment-configs
chmod +x deploy-apprunner.sh
./deploy-apprunner.sh
```

---

## 💰 Cost Estimate

**AWS App Runner:** ~$40-60/month

### Cost Breakdown:
- **Compute:** $0.064/vCPU-hour + $0.007/GB-hour
- **2 vCPU, 4GB RAM always-on:** ~$45/month
- **Data transfer:** ~$5/month
- **ECR storage:** ~$0.10/month
- **Secrets Manager:** ~$0.40/month

**Total: ~$50/month**

---

## 📋 Prerequisites

### 1. Install AWS CLI

**Windows:**
```cmd
winget install Amazon.AWSCLI
```

**Mac:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. Configure AWS CLI
```bash
aws configure

# You'll need:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (e.g., us-east-1)
# - Output format (json)
```

**Get AWS credentials:**
1. Go to AWS Console: https://console.aws.amazon.com
2. Click your name → Security credentials
3. "Access keys" → "Create access key"
4. Save the keys

### 3. Install Docker Desktop

Download from: https://www.docker.com/products/docker-desktop

### 4. Get Telegram Credentials

1. Go to https://my.telegram.org
2. Login and create app
3. Save:
   - API ID
   - API Hash
   - Phone number

---

## 🚀 Deployment Steps

### Automated Deployment:

Just run the script! It will:

1. ✅ Check AWS configuration
2. ✅ Create ECR repository
3. ✅ Build Docker image
4. ✅ Push to ECR
5. ✅ Create IAM roles
6. ✅ Store secrets in Secrets Manager
7. ✅ Create App Runner service
8. ✅ Deploy and start

### Manual Deployment:

If you prefer step-by-step control:

#### Step 1: Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name telegram-bot-ollama \
  --region us-east-1
```

#### Step 2: Login to ECR
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=us-east-1

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

#### Step 3: Build and Push Image
```bash
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system

# Build
docker build -f deployment-configs/Dockerfile -t telegram-bot-ollama .

# Tag
docker tag telegram-bot-ollama:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/telegram-bot-ollama:latest

# Push
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/telegram-bot-ollama:latest
```

#### Step 4: Create IAM Role
```bash
# Create trust policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "build.apprunner.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create role
aws iam create-role \
  --role-name AppRunnerECRAccessRole \
  --assume-role-policy-document file://trust-policy.json

# Attach policy
aws iam attach-role-policy \
  --role-name AppRunnerECRAccessRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
```

#### Step 5: Store Telegram Credentials in Secrets Manager
```bash
aws secretsmanager create-secret \
  --name telegram-credentials \
  --region us-east-1 \
  --secret-string '{"api_id":"YOUR_API_ID","api_hash":"YOUR_API_HASH","phone":"+12345678900"}'
```

#### Step 6: Create App Runner Service
```bash
# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name AppRunnerECRAccessRole --query Role.Arn --output text)

# Create service configuration file
cat > apprunner-config.json <<EOF
{
  "ServiceName": "telegram-bot-ollama",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/telegram-bot-ollama:latest",
      "ImageConfiguration": {
        "Port": "8080",
        "RuntimeEnvironmentVariables": {
          "OLLAMA_MODEL": "llama2"
        }
      },
      "ImageRepositoryType": "ECR"
    },
    "AuthenticationConfiguration": {
      "AccessRoleArn": "$ROLE_ARN"
    },
    "AutoDeploymentsEnabled": true
  },
  "InstanceConfiguration": {
    "Cpu": "2048",
    "Memory": "4096",
    "InstanceRoleArn": "$ROLE_ARN"
  },
  "HealthCheckConfiguration": {
    "Protocol": "TCP",
    "Path": "/",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }
}
EOF

# Create service
aws apprunner create-service --cli-input-json file://apprunner-config.json --region us-east-1
```

---

## 📊 After Deployment

### Check Service Status:
```bash
aws apprunner describe-service \
  --service-arn YOUR_SERVICE_ARN \
  --region us-east-1
```

### View Logs:
```bash
# Get log group name
LOG_GROUP=$(aws apprunner describe-service \
  --service-arn YOUR_SERVICE_ARN \
  --query 'Service.ServiceUrl' \
  --output text)

# View logs
aws logs tail /aws/apprunner/$LOG_GROUP --follow
```

### Update Environment Variables:
```bash
aws apprunner update-service \
  --service-arn YOUR_SERVICE_ARN \
  --source-configuration ImageRepository={ImageConfiguration={RuntimeEnvironmentVariables={OLLAMA_MODEL=mistral}}} \
  --region us-east-1
```

### Pause Service (Save Money):
```bash
aws apprunner pause-service \
  --service-arn YOUR_SERVICE_ARN \
  --region us-east-1
```

### Resume Service:
```bash
aws apprunner resume-service \
  --service-arn YOUR_SERVICE_ARN \
  --region us-east-1
```

### Delete Service:
```bash
aws apprunner delete-service \
  --service-arn YOUR_SERVICE_ARN \
  --region us-east-1
```

---

## 🔧 Troubleshooting

### Issue: "No such file or directory" when building
**Solution:**
```bash
# Make sure you're in the right directory
cd C:\Users\josh\Desktop\GodBrainAI\ai-chat-system

# Then run build
docker build -f deployment-configs/Dockerfile -t telegram-bot-ollama .
```

### Issue: ECR push fails
**Solution:**
```bash
# Re-authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
```

### Issue: "AccessDeniedException"
**Solution:**
```bash
# Check IAM permissions
aws sts get-caller-identity

# Make sure your user has:
# - AmazonEC2ContainerRegistryFullAccess
# - AWSAppRunnerFullAccess
# - IAMFullAccess (or specific AppRunner role creation)
```

### Issue: Bot not starting in App Runner
**Solution:**
```bash
# Check logs for errors
aws logs tail /aws/apprunner/telegram-bot-ollama --follow

# Common issues:
# 1. Ollama model too large for memory (increase to 8GB)
# 2. Telegram credentials incorrect
# 3. Port configuration mismatch
```

### Issue: High costs
**Solution:**
```bash
# Reduce instance size
aws apprunner update-service \
  --service-arn YOUR_SERVICE_ARN \
  --instance-configuration Cpu=1024,Memory=2048 \
  --region us-east-1

# Or pause when not in use
aws apprunner pause-service --service-arn YOUR_SERVICE_ARN --region us-east-1
```

---

## 🔒 Security Best Practices

### 1. Use Secrets Manager
```bash
# Never hardcode credentials
# Always use AWS Secrets Manager

# Rotate secrets regularly:
aws secretsmanager rotate-secret \
  --secret-id telegram-credentials \
  --region us-east-1
```

### 2. Enable VPC for App Runner
```bash
# Create VPC connector
aws apprunner create-vpc-connector \
  --vpc-connector-name telegram-bot-vpc \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-zzz

# Update service to use VPC
aws apprunner update-service \
  --service-arn YOUR_SERVICE_ARN \
  --network-configuration EgressConfiguration={EgressType=VPC,VpcConnectorArn=VPC_CONNECTOR_ARN}
```

### 3. Enable AWS WAF (Optional)
```bash
# Protect against DDoS and web attacks
aws wafv2 associate-web-acl \
  --web-acl-arn YOUR_WAF_ACL_ARN \
  --resource-arn YOUR_SERVICE_ARN
```

---

## 🆚 Comparison: App Runner vs Alternatives

| Feature | App Runner | Cloud Run (GCP) | Render |
|---------|-----------|----------------|--------|
| **Setup** | Medium | Medium | Easy |
| **Cost** | $50/mo | $150/mo | $25/mo |
| **Auto-scale** | ✅ Yes | ✅ Yes | ❌ Manual |
| **Persistent Storage** | S3/EFS | Cloud Storage | Built-in |
| **Cold Starts** | ~10s | ~10s | None |
| **Max Memory** | 16GB | Unlimited | 32GB |
| **Best For** | AWS users | GCP users | Indie devs |

---

## 💡 Pro Tips

### 1. Reduce Costs
```bash
# Use smaller instance for testing
Cpu=1024,Memory=2048  # ~$25/month

# Pause when not in use
aws apprunner pause-service

# Use spot pricing with EC2 instead
# (More complex but potentially cheaper)
```

### 2. Improve Performance
```bash
# Use smaller Ollama models
# llama2:7b = 4GB
# mistral:7b = 4GB  (faster)
# tinyllama = 637MB (very fast)

# Increase instance size for larger models
Cpu=4096,Memory=8192  # For llama2:13b
```

### 3. Monitor Everything
```bash
# Set up CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name telegram-bot-high-cpu \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --metric-name CPUUtilization \
  --namespace AWS/AppRunner \
  --period 300 \
  --statistic Average \
  --threshold 80

# View metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppRunner \
  --metric-name RequestCount \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-31T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### 4. CI/CD Integration
```yaml
# .github/workflows/deploy-apprunner.yml
name: Deploy to App Runner

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and push
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
          docker build -t telegram-bot .
          docker tag telegram-bot ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/telegram-bot:latest
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/telegram-bot:latest
      
      - name: Deploy to App Runner
        run: |
          aws apprunner start-deployment --service-arn ${{ secrets.SERVICE_ARN }}
```

---

## ✅ Deployment Checklist

Before running the deployment script:

- [ ] AWS CLI installed and configured
- [ ] Docker Desktop running
- [ ] AWS IAM user with proper permissions
- [ ] Telegram API credentials ready
- [ ] Billing alerts set up in AWS
- [ ] Decided on instance size (2GB = $25/mo, 4GB = $50/mo)

During deployment:

- [ ] ECR repository created
- [ ] Docker image built successfully
- [ ] Image pushed to ECR
- [ ] IAM role created
- [ ] Secrets stored in Secrets Manager
- [ ] App Runner service created
- [ ] Service status: RUNNING

After deployment:

- [ ] Test bot with Telegram message
- [ ] Check logs for errors
- [ ] Verify Ollama model loaded
- [ ] Monitor costs for first week
- [ ] Set up CloudWatch alarms
- [ ] Configure auto-scaling if needed

---

## 🚀 Quick Command Reference

```bash
# Deploy everything
cd deployment-configs
./deploy-apprunner.bat  # Windows
./deploy-apprunner.sh   # Mac/Linux

# Check service
aws apprunner list-services --region us-east-1

# View logs
aws logs tail /aws/apprunner/telegram-bot-ollama --follow

# Update service
aws apprunner start-deployment --service-arn ARN --region us-east-1

# Pause (save money)
aws apprunner pause-service --service-arn ARN --region us-east-1

# Resume
aws apprunner resume-service --service-arn ARN --region us-east-1

# Delete
aws apprunner delete-service --service-arn ARN --region us-east-1
```

---

## 🎯 Recommendation

### Choose App Runner if:
- ✅ You're already using AWS
- ✅ You need auto-scaling
- ✅ You want AWS ecosystem integration
- ✅ Budget is $50-100/month
- ✅ You need enterprise features

### Choose Render instead if:
- ✅ You want simplest deployment
- ✅ Budget is under $50/month
- ✅ You don't need auto-scaling
- ✅ You prefer all-in-one platform

### Choose Cloud Run if:
- ✅ You're already on GCP
- ✅ You need global deployment
- ✅ Budget is $150+/month
- ✅ You need 99.95% SLA

---

## ❓ Need Help?

**Documentation:**
- App Runner: https://docs.aws.amazon.com/apprunner/
- AWS CLI: https://docs.aws.amazon.com/cli/
- Troubleshooting: https://docs.aws.amazon.com/apprunner/latest/dg/troubleshooting.html

**Support:**
- AWS Console: https://console.aws.amazon.com/apprunner
- AWS Forums: https://forums.aws.amazon.com
- Stack Overflow: https://stackoverflow.com/questions/tagged/aws-app-runner

---

**Ready to deploy?** Run `deploy-apprunner.bat` and follow the prompts! 🚀

@echo off
REM AWS App Runner Deployment Script for Windows
REM Automated deployment of Telegram Bot + Ollama

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo    AWS APP RUNNER DEPLOYMENT
echo    Service: telegram-bot-ollama
echo ============================================================
echo.

REM Configuration
set SERVICE_NAME=telegram-bot-ollama
set AWS_REGION=us-east-1
set ECR_REPO_NAME=telegram-bot-ollama
set APP_RUNNER_ROLE=AppRunnerECRAccessRole

REM Check if AWS CLI is installed
where aws >nul 2>&1
if errorlevel 1 (
    echo [ERROR] AWS CLI not found. Install from: https://aws.amazon.com/cli/
    echo.
    echo Quick install: winget install Amazon.AWSCLI
    exit /b 1
)

echo [OK] AWS CLI found
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Step 1: Configure AWS (if needed)
echo Step 1/10: Checking AWS configuration...
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo AWS not configured. Running aws configure...
    aws configure
) else (
    echo [OK] AWS already configured
    aws sts get-caller-identity
)
echo.

REM Step 2: Get AWS Account ID
echo Step 2/10: Getting AWS Account ID...
for /f "usebackq tokens=*" %%i in (`aws sts get-caller-identity --query Account --output text`) do set AWS_ACCOUNT_ID=%%i
echo [OK] Account ID: %AWS_ACCOUNT_ID%
echo.

REM Step 3: Create ECR repository
echo Step 3/10: Creating ECR repository...
aws ecr describe-repositories --repository-names %ECR_REPO_NAME% --region %AWS_REGION% >nul 2>&1
if errorlevel 1 (
    echo Creating new ECR repository: %ECR_REPO_NAME%
    aws ecr create-repository --repository-name %ECR_REPO_NAME% --region %AWS_REGION%
    echo [OK] ECR repository created
) else (
    echo [OK] ECR repository already exists
)
echo.

set ECR_URI=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPO_NAME%

REM Step 4: Login to ECR
echo Step 4/10: Logging into ECR...
aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com
if errorlevel 1 (
    echo [ERROR] ECR login failed
    exit /b 1
)
echo [OK] Logged into ECR
echo.

REM Step 5: Build Docker image
echo Step 5/10: Building Docker image...
cd ..
docker build -f deployment-configs\Dockerfile -t %SERVICE_NAME% .
if errorlevel 1 (
    echo [ERROR] Docker build failed
    exit /b 1
)
echo [OK] Docker image built
echo.

@echo off
REM Automated Cloud Run Deployment Script for Windows
REM Uses service account: ilabeliman-6dace734925e.json

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo    AUTOMATED CLOUD RUN DEPLOYMENT
echo    Project: ilabeliman
echo    Service: telegram-bot-ollama
echo ============================================================
echo.

REM Configuration
set PROJECT_ID=ilabeliman
set SERVICE_NAME=telegram-bot-ollama
set REGION=us-central1
set SERVICE_ACCOUNT_KEY=../../ilabeliman-6dace734925e.json
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

REM Check if service account key exists
if not exist "%SERVICE_ACCOUNT_KEY%" (
    echo [ERROR] Service account key not found at %SERVICE_ACCOUNT_KEY%
    exit /b 1
)

echo [OK] Service account key found
echo.

REM Step 1: Authenticate with service account
echo Step 1/10: Authenticating with GCP...
gcloud auth activate-service-account --key-file="%SERVICE_ACCOUNT_KEY%"
gcloud config set project %PROJECT_ID%
echo [OK] Authenticated
echo.

REM Step 2: Enable required APIs
echo Step 2/10: Enabling required APIs...
gcloud services enable run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com storage.googleapis.com cloudbuild.googleapis.com --quiet
echo [OK] APIs enabled
echo.

REM Step 3: Create secrets
echo Step 3/10: Setting up secrets...
echo.

REM Check telegram-api-id
gcloud secrets describe telegram-api-id --quiet >nul 2>&1
if errorlevel 1 (
    echo Please enter your Telegram API ID:
    set /p TELEGRAM_API_ID="> "
    echo !TELEGRAM_API_ID!| gcloud secrets create telegram-api-id --data-file=-
    echo [OK] Created telegram-api-id secret
) else (
    echo [OK] telegram-api-id secret already exists
)

REM Check telegram-api-hash  
gcloud secrets describe telegram-api-hash --quiet >nul 2>&1
if errorlevel 1 (
    echo Please enter your Telegram API Hash:
    set /p TELEGRAM_API_HASH="> "
    echo !TELEGRAM_API_HASH!| gcloud secrets create telegram-api-hash --data-file=-
    echo [OK] Created telegram-api-hash secret
) else (
    echo [OK] telegram-api-hash secret already exists
)

REM Check telegram-phone
gcloud secrets describe telegram-phone --quiet >nul 2>&1
if errorlevel 1 (
    echo Please enter your Telegram Phone Number (with country code, e.g. +1234567890):
    set /p TELEGRAM_PHONE="> "
    echo !TELEGRAM_PHONE!| gcloud secrets create telegram-phone --data-file=-
    echo [OK] Created telegram-phone secret
) else (
    echo [OK] telegram-phone secret already exists
)
echo.

REM Step 4: Grant secret access
echo Step 4/10: Granting secret access...
for /f "usebackq" %%i in (`gcloud projects describe %PROJECT_ID% --format="value(projectNumber)"`) do set PROJECT_NUMBER=%%i
set SERVICE_ACCOUNT=%PROJECT_NUMBER%-compute@developer.gserviceaccount.com

for %%s in (telegram-api-id telegram-api-hash telegram-phone) do (
    gcloud secrets add-iam-policy-binding %%s --member="serviceAccount:!SERVICE_ACCOUNT!" --role="roles/secretmanager.secretAccessor" --quiet >nul 2>&1
)
echo [OK] Secret access granted to %SERVICE_ACCOUNT%
echo.

REM Step 5: Create Cloud Storage bucket
echo Step 5/10: Creating Cloud Storage bucket...
set BUCKET_NAME=%PROJECT_ID%-bot-data

gsutil ls -b gs://%BUCKET_NAME% >nul 2>&1
if errorlevel 1 (
    gsutil mb -p %PROJECT_ID% -c STANDARD -l US gs://%BUCKET_NAME%
    echo [OK] Created bucket: gs://%BUCKET_NAME%
) else (
    echo [OK] Bucket already exists: gs://%BUCKET_NAME%
)

gsutil iam ch serviceAccount:%SERVICE_ACCOUNT%:objectAdmin gs://%BUCKET_NAME% >nul 2>&1
echo [OK] Granted bucket access
echo.

REM Step 6: Build Docker image
echo Step 6/10: Building Docker image...
cd ..
docker build -f deployment-configs\Dockerfile -t %SERVICE_NAME% .
if errorlevel 1 (
    echo [ERROR] Docker build failed
    exit /b 1
)
echo [OK] Docker image built successfully
echo.

REM Step 7: Tag image
echo Step 7/10: Tagging image for Google Container Registry...
docker tag %SERVICE_NAME% %IMAGE_NAME%:latest
echo [OK] Image tagged: %IMAGE_NAME%:latest
echo.

REM Step 8: Configure Docker
echo Step 8/10: Configuring Docker authentication...
gcloud auth configure-docker --quiet
echo [OK] Docker configured for GCP
echo.

REM Step 9: Push to GCR
echo Step 9/10: Pushing image to Google Container Registry...
echo This may take 5-10 minutes depending on your internet speed...
docker push %IMAGE_NAME%:latest
if errorlevel 1 (
    echo [ERROR] Docker push failed
    exit /b 1
)
echo [OK] Image pushed to GCR
echo.

REM Step 10: Deploy to Cloud Run  
echo Step 10/10: Deploying to Cloud Run...
echo Configuration: 4GB RAM, 2 CPU, Always-on (min-instances=1)
echo.

gcloud run deploy %SERVICE_NAME% ^
    --image %IMAGE_NAME%:latest ^
    --platform managed ^
    --region %REGION% ^
    --memory 4Gi ^
    --cpu 2 ^
    --min-instances 1 ^
    --max-instances 1 ^
    --timeout 3600 ^
    --no-allow-unauthenticated ^
    --set-secrets="TELEGRAM_API_ID=telegram-api-id:latest,TELEGRAM_API_HASH=telegram-api-hash:latest,TELEGRAM_PHONE=telegram-phone:latest" ^
    --set-env-vars="OLLAMA_MODEL=llama2,GCS_BUCKET=%BUCKET_NAME%" ^
    --service-account=%SERVICE_ACCOUNT% ^
    --quiet

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo    DEPLOYMENT SUCCESSFUL!
    echo ============================================================
    echo.
    echo Service Information:
    gcloud run services describe %SERVICE_NAME% --region %REGION% --format="table(status.url,status.conditions[0].status)"
    echo.
    echo View Logs:
    echo   gcloud run services logs tail %SERVICE_NAME% --region %REGION%
    echo.
    echo Useful Commands:
    echo   Update:  gcloud run services update %SERVICE_NAME% --region %REGION%
    echo   Delete:  gcloud run services delete %SERVICE_NAME% --region %REGION%
    echo   Metrics: gcloud run services describe %SERVICE_NAME% --region %REGION%
    echo.
    echo Monthly Cost Estimate: ~$150 (4GB/2CPU always-on)
    echo WARNING: Don't forget to monitor your billing!
) else (
    echo.
    echo ============================================================
    echo    DEPLOYMENT FAILED
    echo ============================================================
    echo.
    echo Check logs for details:
    echo   gcloud run services logs read %SERVICE_NAME% --region %REGION% --limit 50
    exit /b 1
)

endlocal

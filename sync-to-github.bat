@echo off
REM Sync ai-chat-system to GitHub
REM Repository: https://github.com/ilabelagent/TelAuto.git

echo.
echo ============================================================
echo    SYNCING TO GITHUB
echo    Repository: https://github.com/ilabelagent/TelAuto.git
echo ============================================================
echo.

REM Check if git is installed
where git >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found. Install from: https://git-scm.com/download/win
    echo.
    echo Quick install: winget install Git.Git
    pause
    exit /b 1
)

echo [OK] Git found
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check if this is already a git repo
if exist ".git" (
    echo [INFO] Git repository already initialized
) else (
    echo [STEP 1] Initializing git repository...
    git init
    echo [OK] Git initialized
)
echo.

REM Check if .gitignore exists
if exist ".gitignore" (
    echo [OK] .gitignore found
) else (
    echo [WARNING] .gitignore not found! Creating one...
    echo node_modules/ > .gitignore
    echo *.json >> .gitignore
    echo .env >> .gitignore
)
echo.

REM Create README if it doesn't exist
if not exist "README.md" (
    echo [STEP 2] Creating README.md...
    (
        echo # TelAuto - Telegram Bot with Ollama
        echo.
        echo Intelligent Telegram bot powered by Ollama \(local LLM\)
        echo.
        echo ## Features
        echo - Self-learning conversational AI
        echo - Ollama integration for local LLM
        echo - Multi-platform deployment \(AWS, GCP, Render\)
        echo - Personality adaptation
        echo - Context-aware responses
        echo.
        echo ## Quick Start
        echo See deployment-configs/ for deployment guides
        echo.
        echo ## Deployment Options
        echo - AWS App Runner: ~$50/month
        echo - Google Cloud Run: ~$150/month
        echo - Render: ~$25/month
        echo - Local: Free
    ) > README.md
    echo [OK] README.md created
)
echo.

REM Add all files
echo [STEP 3] Adding files to git...
git add .
echo [OK] Files added
echo.

REM Show what will be committed
echo [INFO] Files to be committed:
git status --short
echo.

REM Commit
echo [STEP 4] Committing changes...
git commit -m "Initial commit: Telegram bot with Ollama integration and multi-cloud deployment configs"
if errorlevel 1 (
    echo [INFO] Nothing to commit or commit failed
    echo Checking if there are already commits...
    git log --oneline -1 >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] No commits found. Something went wrong.
        pause
        exit /b 1
    ) else (
        echo [OK] Repository already has commits
    )
) else (
    echo [OK] Changes committed
)
echo.

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo [STEP 5] Adding remote repository...
    git remote add origin https://github.com/ilabelagent/TelAuto.git
    echo [OK] Remote added
) else (
    echo [INFO] Remote 'origin' already exists
    echo Current remote:
    git remote get-url origin
    echo.
    echo Do you want to update it? (Y/N)
    set /p UPDATE_REMOTE="> "
    if /i "!UPDATE_REMOTE!"=="Y" (
        git remote set-url origin https://github.com/ilabelagent/TelAuto.git
        echo [OK] Remote updated
    )
)
echo.

REM Get current branch name
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i

if "%BRANCH%"=="" (
    set BRANCH=main
    echo [INFO] No branch detected, using 'main'
    git branch -M main
)

echo [STEP 6] Pushing to GitHub (branch: %BRANCH%)...
echo.
echo This will push to: https://github.com/ilabelagent/TelAuto.git
echo.

git push -u origin %BRANCH%

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo Common reasons:
    echo 1. Repository doesn't exist on GitHub - create it first
    echo 2. Authentication failed - you may need to login
    echo 3. Branch protection rules
    echo.
    echo To authenticate:
    echo - GitHub CLI: gh auth login
    echo - Or use Git Credential Manager
    echo - Or use Personal Access Token
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ============================================================
    echo    SUCCESS! Code synced to GitHub
    echo ============================================================
    echo.
    echo Repository: https://github.com/ilabelagent/TelAuto.git
    echo Branch: %BRANCH%
    echo.
    echo Next steps:
    echo 1. View repo: https://github.com/ilabelagent/TelAuto
    echo 2. Deploy to Render: Connect GitHub repo to Render.com
    echo 3. Deploy to AWS: Run deploy-apprunner.bat
    echo 4. Deploy to GCP: Run auto-deploy-cloudrun.bat
    echo.
)

pause

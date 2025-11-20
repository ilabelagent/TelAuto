@echo off
REM launcher.bat - WINDOWS ONE-CLICK LAUNCHER!

echo ============================================================
echo          AI CHAT SYSTEM - ONE CLICK LAUNCHER          
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed!
    echo Please install Python from python.org
    pause
    exit /b 1
)

echo [1/3] Checking system...

REM Create main Python file if it doesn't exist
if not exist "ai_chat_system.py" (
    echo [2/3] Creating system files...
    echo # AI Chat System > ai_chat_system.py
    echo print("Please replace this with the complete code from the artifact"^) >> ai_chat_system.py
)

echo [3/3] Starting AI Chat System...
echo.
echo ============================================================
echo                    SYSTEM STARTING!                    
echo ============================================================
echo.
echo Your browser will open automatically...
echo.

REM Run the Python script
python ai_chat_system.py

REM Keep window open
echo.
echo Press any key to exit...
pause >nul

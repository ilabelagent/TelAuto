#!/bin/bash
# launcher.sh - ONE CLICK LAUNCH!

echo "
╔════════════════════════════════════════════════════════════╗
║          🚀 AI CHAT SYSTEM - ONE CLICK LAUNCHER 🚀         ║
╚════════════════════════════════════════════════════════════╝

Setting up your AI Chat System...
"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Create the all-in-one Python file if it doesn't exist
if [ ! -f "ai_chat_system.py" ]; then
    echo "📥 Downloading AI Chat System..."
    
    # In production, this would download from your server
    # For now, create a placeholder
    cat > ai_chat_system.py << 'EOF'
# This would be the complete bundle code from the artifact above
print("AI Chat System would run here")
print("Please copy the complete code from the artifact")
EOF
fi

# Check for virtual environment
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Mac/Linux
    source venv/bin/activate
fi

# Install/update pip
echo "📦 Updating pip..."
pip install --upgrade pip --quiet

# Run the all-in-one system
echo "
╔════════════════════════════════════════════════════════════╗
║                    🎉 LAUNCHING SYSTEM! 🎉                 ║
╚════════════════════════════════════════════════════════════╝
"

# Launch the Python script
python3 ai_chat_system.py

# Keep terminal open on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    read -p "Press any key to exit..."
fi

#!/bin/bash
# Start script for Telegram Bot + Ollama

echo "🚀 Starting Ollama service..."
ollama serve &

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to start..."
sleep 5

# Pull the default model (you can change this)
echo "📥 Pulling Ollama model (llama2)..."
ollama pull llama2

echo "🤖 Starting Telegram Bot..."
node intelligent-telegram-userbot.js

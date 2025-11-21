# Lightweight Dockerfile for Telegram Bot with Gemini API
# No Ollama needed since we use cloud-based Gemini

FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY telbot/package.json ./
COPY telbot/package-lock.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts 2>/dev/null || npm install --only=production

# Copy all application files
COPY telbot/ ./

# Create data directory for learning system
RUN mkdir -p /app/data

# Expose port for Cloud Run
EXPOSE 8080

# Start both health check server and bot
CMD node healthcheck.js & node intelligent-telegram-userbot.js

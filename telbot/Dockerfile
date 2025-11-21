# Lightweight Dockerfile for Telegram Bot with Gemini API

FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (without package-lock to get latest 'input')
RUN npm install --only=production

# Copy all application files
COPY *.js *.json ./

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 8080

# Start both health check and bot
CMD node healthcheck.js & node intelligent-telegram-userbot.js

# Dockerfile for Telegram Bot + Ollama
# Works on: Render, GCP Cloud Run, AWS App Runner

FROM node:20-slim

# Install Ollama
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://ollama.com/install.sh | sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY telbot/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY telbot/ .

# Create data directory for learning system
RUN mkdir -p /app/data

# Expose port (if needed for health checks)
EXPOSE 8080

# Start script that launches both Ollama and bot
COPY deployment-configs/start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
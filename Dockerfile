# Use Puppeteer image as the base
FROM --platform=linux/amd64 ghcr.io/puppeteer/puppeteer:23.9.0

# Temporarily switch to root for installing dependencies
USER root

# Install required dependencies
RUN apt-get update && \
  apt-get install -y wget gnupg ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# Download and install the latest Chrome package directly
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
  apt-get update && \
  apt-get install -y ./google-chrome-stable_current_amd64.deb && \
  rm google-chrome-stable_current_amd64.deb && \
  rm -rf /var/lib/apt/lists/*

# Revert to the non-root Puppeteer user
USER pptruser

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set working directory
WORKDIR /usr/src/app

# Copy application files and configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Install dependencies
RUN npm ci

# Build the application (ensure this step exists in your project)
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Copy application source code
COPY . .

# Command to run your application
CMD ["node", "dist/index.js"]

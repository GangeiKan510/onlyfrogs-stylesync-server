#!/usr/bin/env bash
set -o errexit

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma Client and build the project
echo "Running Prisma generate and TypeScript build..."
npx prisma generate
rimraf dist && tsc --noEmit false && tsc-alias

# Define Puppeteer cache directory
PUPPETEER_CACHE_DIR="/opt/render/project/puppeteer"

# Handle Puppeteer cache and Chromium installation
echo "Handling Puppeteer cache and installing Chromium..."
mkdir -p "$PUPPETEER_CACHE_DIR"

# Install Chromium
npx puppeteer install --path "$PUPPETEER_CACHE_DIR"

# Verify installation
echo "Verifying Chromium installation..."
if [[ -d "$PUPPETEER_CACHE_DIR/chromium" ]]; then
  echo "Chromium installed successfully."
  ls -al "$PUPPETEER_CACHE_DIR/chromium"
else
  echo "Chromium installation failed. Reinstalling..."
  npx puppeteer install --path "$PUPPETEER_CACHE_DIR"
fi

# Final directory structure verification
echo "Final Puppeteer cache directory structure:"
ls -al "$PUPPETEER_CACHE_DIR"

echo "Build complete!"

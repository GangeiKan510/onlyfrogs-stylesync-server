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
export PUPPETEER_CACHE_DIR="/opt/render/project/puppeteer"

# Install Chromium
echo "Installing Chromium..."
npx puppeteer install --path "$PUPPETEER_CACHE_DIR"

# Verify Chromium installation
CHROMIUM_PATH="$PUPPETEER_CACHE_DIR/chromium/chrome-linux64/chrome"
if [[ -f "$CHROMIUM_PATH" ]]; then
  echo "Chromium installed successfully at $CHROMIUM_PATH."
else
  echo "Error: Chromium not found at $CHROMIUM_PATH."
  exit 1
fi

echo "Build complete!"

#!/usr/bin/env bash
set -o errexit

# Install dependencies
echo "Installing dependencies..."
npm install

# Run Prisma and build the project
echo "Running Prisma generate and TypeScript build..."
npx prisma generate
rimraf dist && tsc --noEmit false && tsc-alias

# Define Puppeteer cache directory
PUPPETEER_CACHE_DIR="/opt/render/project/puppeteer"

# Handle Puppeteer cache and Chromium installation
echo "Handling Puppeteer cache..."
if [[ ! -f "$PUPPETEER_CACHE_DIR/chromium/chrome-linux64/chrome" ]]; then
  echo "Chromium not found. Installing Chromium..."
  mkdir -p "$PUPPETEER_CACHE_DIR"
  npx puppeteer install
else
  echo "Chromium already installed. Copying Puppeteer cache..."
  cp -R "$PUPPETEER_CACHE_DIR" "$XDG_CACHE_HOME/puppeteer/"
fi

echo "Build complete!"

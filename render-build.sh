#!/usr/bin/env bash
# Exit on errors
set -o errexit

echo "Installing dependencies..."
npm install

echo "Running build script..."
rimraf dist && tsc --noEmit false && tsc-alias && prisma generate

echo "Handling Puppeteer cache..."

# Define Puppeteer cache directory
export PUPPETEER_CACHE_DIR="/opt/render/project/puppeteer"

# Store or pull Puppeteer cache with the build cache
if [[ ! -d "$PUPPETEER_CACHE_DIR" ]]; then
  echo "Copying Puppeteer Cache from Build Cache"
  cp -R "$XDG_CACHE_HOME/puppeteer/" "$PUPPETEER_CACHE_DIR"
else
  echo "Installing Chromium..."
  npx puppeteer install
  cp -R "$PUPPETEER_CACHE_DIR" "$XDG_CACHE_HOME"
fi

echo "Installing Chromium for Puppeteer..."
npx puppeteer browsers install chrome

echo "Build complete!"

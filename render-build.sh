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
if [[ ! -d "$PUPPETEER_CACHE_DIR/chromium" ]]; then
  echo "Chromium not found. Installing Chromium..."
  mkdir -p "$PUPPETEER_CACHE_DIR"
  npx puppeteer install --path "$PUPPETEER_CACHE_DIR"

  echo "Installed Chromium contents:"
  ls -al "$PUPPETEER_CACHE_DIR/chromium"
else
  echo "Using cached Chromium..."
  cp -R "$PUPPETEER_CACHE_DIR" "$XDG_CACHE_HOME"
fi

# Log directory structure for debugging
echo "Directory structure of Puppeteer cache:"
ls -al "$PUPPETEER_CACHE_DIR"
ls -al "$PUPPETEER_CACHE_DIR/chromium"
ls -al "$PUPPETEER_CACHE_DIR/chromium/chrome-linux64"

echo "Build complete!"

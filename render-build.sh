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
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then 
  echo "Copying Puppeteer cache from build cache..."
  mkdir -p $PUPPETEER_CACHE_DIR
  cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR || true
else 
  echo "Storing Puppeteer cache in build cache..."
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME || true
fi

echo "Installing Chromium for Puppeteer..."
npx puppeteer browsers install chrome

echo "Build complete!"

FROM ghcr.io/puppeteer/puppeteer:23.8.0

ENV PUPPETEER_SKIP_CHROMIUM=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci && rimraf dist && tsc --noEmit false && tsc-alias && prisma generate
COPY . .
CMD ["node", "dist/index.js"]
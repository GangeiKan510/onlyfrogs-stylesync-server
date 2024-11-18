import { Request, Response, Router } from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const router = Router();

puppeteer.use(StealthPlugin());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/scrape-zalora', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        '[data-test-id="productLink"]'
      );
      const productData: Array<{
        name: string;
        price: string;
        image: string;
        productUrl: string;
        brand: string;
      }> = [];

      productElements.forEach((element) => {
        const name =
          element
            .querySelector('[data-test-id="productTitle"]')
            ?.textContent?.trim() || '';
        const price =
          element
            .querySelector('[data-test-id="originalPrice"]')
            ?.textContent?.trim() || '';
        const image = element.querySelector('img')?.getAttribute('src') || '';
        const productUrl = element.getAttribute('href') || '';
        const brand =
          element
            .querySelector('[data-test-id="productBrandName"]')
            ?.textContent?.trim() || '';

        if (name && price && productUrl) {
          productData.push({ name, price, image, productUrl, brand });
        }
      });

      return productData;
    });

    await browser.close();

    res.status(200).json({ products });
  } catch (error: any) {
    console.error('Error scraping shop:', error.message);
    res.status(500).json({ error: 'Failed to scrape the shop items.' });
  }
});

router.post('/scrape-bench', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('.item.product-item');
      const productData: Array<{
        name: string;
        price: string;
        image: string;
        productUrl: string;
        brand: string;
      }> = [];

      productElements.forEach((element) => {
        const name =
          element.querySelector('.product-item-link')?.textContent?.trim() ||
          '';
        const price =
          element.querySelector('.price')?.textContent?.trim() || '';
        const image =
          element.querySelector('.main-img')?.getAttribute('src') || '';
        const productUrl =
          element
            .querySelector('.product.photo.product-item-photo')
            ?.getAttribute('href') || '';
        const brand =
          element.querySelector('.product-item-brand')?.textContent?.trim() ||
          '';

        if (name && price && productUrl) {
          productData.push({ name, price, image, productUrl, brand });
        }
      });

      return productData;
    });

    await browser.close();

    res.status(200).json({ products });
  } catch (error: any) {
    console.error('Error scraping Bench site:', error.message);
    res.status(500).json({ error: 'Failed to scrape Bench shop items.' });
  }
});

router.post('/scrape-shein', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    await page.waitForSelector('.product-card', { timeout: 30000 });

    const products = await page.evaluate(() => {
      const productCards = document.querySelectorAll('.product-card');
      const productData: Array<{
        name: string;
        price: string;
        image: string;
        productUrl: string;
      }> = [];

      productCards.forEach((card) => {
        const name =
          card.querySelector('.goods-title-link')?.textContent?.trim() ||
          'No Name';
        const price =
          card
            .querySelector('.normal-price-ctn__sale-price')
            ?.textContent?.trim() || 'No Price';
        const image =
          card
            .querySelector('.crop-image-container img')
            ?.getAttribute('src') || 'No Image';
        const productUrl =
          card
            .querySelector('.S-product-card__img-container')
            ?.getAttribute('href') || 'No URL';

        if (name && price && productUrl) {
          productData.push({
            name,
            price,
            image,
            productUrl: `https://www.shein.com${productUrl}`,
          });
        }
      });

      return productData;
    });

    await browser.close();

    res.status(200).json({ products });
  } catch (error: any) {
    console.error('Error scraping Shein:', error.message);
    res.status(500).json({ error: 'Failed to scrape the shop items.' });
  }
});

router.post('/scrape-penshoppe', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    await page.waitForSelector('.grid__item.grid-product', { timeout: 30000 });

    const products = await page.evaluate(() => {
      const productCards = document.querySelectorAll(
        '.grid__item.grid-product'
      );

      const productData: Array<{
        name: string;
        price: string;
        image: string;
        productUrl: string;
      }> = [];

      productCards.forEach((card) => {
        const name =
          card.querySelector('.grid-product__title')?.textContent?.trim() ||
          'No Name';
        const price =
          card
            .querySelector('.grid-product__price span')
            ?.textContent?.trim() || 'No Price';
        const image =
          card.querySelector('.grid-product__image img')?.getAttribute('src') ||
          'No Image';
        const productUrl =
          card.querySelector('.grid-product__link')?.getAttribute('href') ||
          'No URL';

        if (name && price && productUrl) {
          productData.push({
            name,
            price,
            image: `https://www.penshoppe.com${image}`,
            productUrl: `https://www.penshoppe.com${productUrl}`,
          });
        }
      });

      return productData;
    });

    await browser.close();

    res.status(200).json({ products });
  } catch (error: any) {
    console.error('Error scraping Penshoppe:', error.message);
    res.status(500).json({ error: 'Failed to scrape the shop items.' });
  }
});

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;

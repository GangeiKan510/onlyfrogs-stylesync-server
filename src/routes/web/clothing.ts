import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import {
  CreateClothingRequestBodySchema,
  UpdateClothingRequestBodySchema,
  UpdateWornDateSchema,
} from '../../validators/schemas/schemas';
import {
  createClothing,
  deleteClothing,
  updateClothing,
  updateWornDate,
} from '../../controllers/clothing';
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

router.get('/get-clothes', (req, res) => {
  res.send("You're trying to get clothes!");
});

router.post(
  '/create-clothing',
  validate(CreateClothingRequestBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { image_url, category, tags, user_id, closet_id } = req.body;

      const clothingItem = await createClothing({
        image_url,
        category,
        tags,
        user_id,
        closet_id,
      });

      res.status(201).json({
        message: 'Clothing item created successfully',
        clothingItem,
      });
    } catch (error: any) {
      console.error('Error creating clothing:', error.message);
      res.status(500).json({ error: 'Failed to create clothing item' });
    }
  }
);

router.post(
  '/update-clothing',
  validate(UpdateClothingRequestBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { id, ...updateFields } = req.body;

      const updatedClothing = await updateClothing(id, updateFields);

      if (!updatedClothing) {
        return res.status(404).json({ error: 'Clothing item not found' });
      }

      res.status(200).json({
        message: 'Clothing item updated successfully',
        updatedClothing,
      });
    } catch (error: any) {
      console.error('Error updating clothing:', error.message);
      res.status(500).json({ error: 'Failed to update clothing item' });
    }
  }
);

router.delete('/delete-clothing', async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Clothing ID is required.' });
  }

  try {
    const deletedClothing = await deleteClothing(id);

    if (!deletedClothing) {
      return res.status(404).json({ error: 'Clothing item not found' });
    }

    res.status(200).json({
      message: 'Clothing item deleted successfully',
      deletedClothing,
    });
  } catch (error: any) {
    console.error('Error deleting clothing:', error.message);
    res.status(500).json({ error: 'Failed to delete clothing item' });
  }
});

router.post('/analyze-item', async (req: Request, res: Response) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const validateImage = async (url: string) => {
      try {
        const response = await axios.head(url);
        return (
          response.status === 200 &&
          response.headers['content-type'].includes('image')
        );
      } catch (error) {
        return false;
      }
    };

    const isValidImage = await validateImage(imageUrl);
    if (!isValidImage) {
      return res
        .status(400)
        .json({ error: 'Invalid or inaccessible image URL.' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
                Analyze the image at the following URL and return the following structured data:
                {
                  "category": {
                      "name": "Tops", // Example categories: Tops, Pants, Outerwear, etc.
                      "type": "T-Shirts" // Example subcategories: T-Shirts, Jackets, etc.
                  },
                  "material": "Cotton", // Valid options: Cotton, Polyester, etc. Default: "Other Materials"
                  "occasion": ["Casual", "Travel"], // Use valid options. Default: []
                  "pattern": "Solid", // Use valid options. Default: "Other Patterns"
                  "season": ["Summer", "Spring"] // Use valid options. Default: []
                  "color": "Blue" // Use a single valid value. Default: null.
                }

                Use the following predefined options:
                - **Season:** Spring, Summer, Autumn, Winter
                - **Occasion:** Daily, Work, Date, Formal, Travel, Home, Party, Sport, Casual, Beach, Others
                - **Categories and Types:** {list provided in your original example}
                - **Materials:** Cotton, Polyester, Nylon, etc.
                - **Patterns:** Solid, Floral, Striped, etc.
                - **Colors:** White, Cream, Beige, Light-Gray, Dark-Gray, Black, Light-Pink, Yellow, Light-Green, Torquoise, Light-Blue, Light-Purple, Silver, Pink, Coral, Orange, Green, Blue, Purple, Red, Camel, Brown, Khaki, Navy, Wine, Gold

                Only output the JSON object, and default unrecognized fields to "Other Materials" or "Other Patterns."
              `,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
          ],
        },
      ],
    });

    const gptResponse = response.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res
        .status(500)
        .json({ error: 'No valid response from OpenAI Vision API.' });
    }

    const cleanedResponse = gptResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let analyzedTags;
    try {
      analyzedTags = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        'Failed to parse GPT response:',
        cleanedResponse,
        parseError
      );
      return res.status(500).json({
        error: 'Failed to parse the response from OpenAI Vision API.',
      });
    }

    analyzedTags = {
      category: analyzedTags.category || { name: 'Unknown', type: 'Unknown' },
      material: analyzedTags.material || 'Other Materials',
      occasion: Array.isArray(analyzedTags.occasion)
        ? analyzedTags.occasion
        : [],
      pattern: analyzedTags.pattern || 'Other Patterns',
      season: Array.isArray(analyzedTags.season) ? analyzedTags.season : [],
      color: typeof analyzedTags.color === 'string' ? analyzedTags.color : null,
    };

    return res.status(200).json({ tags: analyzedTags });
  } catch (error: any) {
    if (error.message?.includes('Timeout')) {
      console.error('Image URL timed out:', imageUrl);
      return res.status(400).json({
        error: 'Image URL timed out. Please try again with a different image.',
      });
    }

    console.error('Error processing image with OpenAI Vision API:', error);
    return res.status(500).json({ error: 'Failed to process the image.' });
  }
});

router.post(
  '/update-worn-date',
  validate(UpdateWornDateSchema),
  async (req: Request, res: Response) => {
    const { clothing_id } = req.body;

    if (!clothing_id) {
      return res.status(400).json({ error: 'Clothing ID is required.' });
    }

    try {
      const updatedWorn = await updateWornDate(clothing_id);

      if (!updatedWorn) {
        return res
          .status(404)
          .json({ error: 'No worn record found for the given clothing item.' });
      }

      res.status(200).json({
        message: 'Worn date updated successfully.',
        updatedWorn,
      });
    } catch (error: any) {
      console.error('Error updating worn date:', error.message);
      res.status(500).json({ error: 'Failed to update worn date' });
    }
  }
);

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

import { Request, Response, Router } from 'express';
import {
  deleteChatSessionMessages,
  retrieveSessionChat,
} from '../../controllers/chat';
import OpenAI from 'openai';
import axios from 'axios';
import { sendMessage } from '../../controllers/chat';
import { getUserById } from '../../controllers/user';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const router = Router();

puppeteer.use(StealthPlugin());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/prompt-gpt', async (req: Request, res: Response) => {
  const { userId, userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'User message is required' });
  }

  try {
    // Fetch user data
    const userResult = await getUserById(userId);
    if (userResult.status !== 200) {
      return res.status(userResult.status).json(userResult);
    }

    const user = userResult.user;

    const consider_skin_tone = user?.promptSettings?.consider_skin_tone;
    const prioritize_preferences = user?.promptSettings?.prioritize_preferences;

    let lat, lon, locationName, weatherDescription, temperature, windSpeed;

    if (user?.location) {
      const locationData = user.location as {
        lat: string;
        lon: string;
        name: string;
      };

      lat = locationData?.lat;
      lon = locationData?.lon;
      locationName = locationData?.name;
    }

    if (lat && lon) {
      const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
      );

      const weatherData = weatherResponse.data;
      temperature = weatherData.main.temp;
      weatherDescription = weatherData.weather[0].description;
      windSpeed = weatherData.wind.speed;
    } else {
      weatherDescription = 'unknown weather';
      temperature = 'unknown temperature';
      windSpeed = 'unknown wind speed';
    }

    const saveUserMessageResult = await sendMessage(
      userId,
      userMessage,
      'user'
    );
    if (saveUserMessageResult.status !== 200) {
      return res
        .status(saveUserMessageResult.status)
        .json(saveUserMessageResult);
    }

    const previousMessages =
      user?.chat_ession?.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) ?? [];

    const userClothes = user?.clothes || [];

    let clothingMessage = '';

    if (userClothes.length > 0) {
      clothingMessage = `
      The user has the following clothing items in their closet:
      ${userClothes
        .map(
          (item) => `
      - **Your ${item.name}**:
        - Brand: ${item.brand}
        - Category: ${item.category}
        - Color: ${item.color}
        - Occasion: ${item.occasion}
        - Pattern: ${item.pattern}
        - Season: ${item.season}
        - Material: ${item.material}
        - Image URL: ${item.image_url ? item.image_url : 'N/A'}
      `
        )
        .join('\n')} 
      Please prioritize these items when suggesting outfits. 
      When referencing these items in the outfit suggestion, **always prepend "Your"** to the item name (e.g., "Your Blue Hoodie"). For example:
      - Your Blue Hoodie: Available in the closet.
      - Your Black Jeans: Perfect for casual outings.
    
      If essential items are missing, feel free to suggest generic options to pair with them. Ensure that all chosen clothing from the closet includes its images using markdown image syntax like \`![Item Name](image_url)\`.
      `;
    } else {
      clothingMessage = `
        The user has no clothing items in their closet.
        Please suggest a complete outfit based on the current weather conditions:
        - Weather: ${weatherDescription}
        - Temperature: ${temperature}°C
        - Wind Speed: ${windSpeed} m/s.
        Include generic items suitable for these conditions.
      `;
    }

    const preferencesMessage = prioritize_preferences
      ? `
    When suggesting outfits, prioritize the following preferences:
    - **Style Preferences**: ${user?.style_preferences.join(', ') || 'unknown'}
    - **Favorite Colors**: ${user?.favorite_colors.join(', ') || 'unknown'}
    - **Preferred Brands**: ${user?.preferred_brands.join(', ') || 'unknown'}.
    `
      : '';

    const skinToneMessage = consider_skin_tone
      ? `
    Consider the user's skin tone when suggesting colors for outfits:
    - **Skin Tone**: ${user?.skin_tone_classification || 'unknown'}
    - **Complementary Colors**: ${user?.skin_tone_complements.join(', ') || 'unknown'}.
    `
      : '';

    const systemMessageContent = `
    You are a virtual stylist assistant named Ali.
    Your job is to create complete outfit suggestions and answer questions related to fashion, clothing, and style based on the user's preferences, closet, and the current weather. 
    
    ### Important Rules:
    1. **Fashion-Only Responses**: Only respond to queries that are directly related to fashion, style, clothing, accessories, or the user's closet. Politely decline to answer any questions that are not related to these topics, stating that you are a virtual stylist assistant and can only help with fashion-related queries.
    2. **Closet Priority**: Always prioritize items from the user's closet when suggesting an outfit.
    3. **Cultural Appropriateness**: Consider the user's location (${locationName || 'unknown'}) and ensure that your outfit suggestions align with local cultural norms, dress codes, and societal expectations.
    4. **Complete the Outfit**: If there are not enough items in the closet to form a complete outfit, suggest generic options that pair well with the available clothing.
    5. **Markdown Images**: Include markdown image links for all closet items using this syntax: \`![Item Name](image_url)\`. Do not include images for generic suggestions.
    6. **Weather Consideration**: Ensure that the outfit is appropriate for the current weather. The user is currently experiencing the following conditions:
       - Weather: ${weatherDescription || 'unknown'}
       - Temperature: ${temperature || 'unknown'}°C
       - Wind Speed: ${windSpeed || 'unknown'} m/s.
    7. If you chose clothing items from closet, always include "Your" prepend before the item name to indicate it's from the user's closet.
    
    ${preferencesMessage}
    ${skinToneMessage}
    ${clothingMessage}
    ### User Information:
    - **Name**: ${user?.first_name} ${user?.last_name || ''}
    - **Location**: ${locationName || 'unknown'}
    - **Skin Tone**: ${user?.skin_tone_classification || 'unknown'}
    - **Complementary Colors**: ${user?.skin_tone_complements.join(', ') || 'unknown'}
    - **Style Preferences**: ${user?.style_preferences.join(', ') || 'unknown'}
    - **Favorite Colors**: ${user?.favorite_colors.join(', ') || 'unknown'}
    - **Preferred Brands**: ${user?.preferred_brands.join(', ') || 'unknown'}
    - **Body Type**: ${user?.body_type || 'unknown'}
    - **Season**: ${user?.season || 'unknown'}
    - **Budget**: ${user?.budget_min || 'unknown'} - ${user?.budget_max || 'unknown'} USD.
    
    ### Responses to Non-Fashion Queries:
    If the user asks a question that is not related to fashion, style, or clothing, respond politely with:
    "I'm sorry, but I am a virtual stylist assistant and can only assist with fashion-related questions."
    ### Closet Items:
    The user has the following items in their closet:
    ${userClothes
      .map(
        (item) => `
    - **${item.name}**:
      - Brand: ${item.brand || 'unknown'}
      - Category: ${item.category || 'unknown'}
      - Color: ${item.color || 'unknown'}
      - Occasion: ${item.occasion || 'unknown'}
      - Pattern: ${item.pattern || 'unknown'}
      - Season: ${item.season || 'unknown'}
      - Material: ${item.material || 'unknown'}
      - ![${item.name}](${item.image_url || 'No image available'})
    `
      )
      .join('\n')}
    
    ### Output Format:
    - Provide the response in markdown format.
    - Use headings like \`## Outfit Suggestion\` to structure the response.
    - List all items in the outfit with bullet points.
    - For items from the user's closet, prepend "Your" to the item name (e.g., "Your Blue Hoodie").
    - Include markdown image links for the closet items.
    - For any generic items, list them without images.
    `;

    const fullConversation = [
      { role: 'system', content: systemMessageContent },
      ...previousMessages,
      { role: 'user', content: userMessage },
    ];

    console.log('FULL CONVERSATION', fullConversation);
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: fullConversation,
    });

    const gptResponse = openaiResponse.choices[0]?.message?.content || null;

    if (!gptResponse) {
      return res.status(500).json({ error: 'No valid response from GPT' });
    }

    const formattedResponse = gptResponse;

    const saveAssistantMessageResult = await sendMessage(
      userId,
      formattedResponse,
      'assistant'
    );

    if (saveAssistantMessageResult.status !== 200) {
      return res
        .status(saveAssistantMessageResult.status)
        .json(saveAssistantMessageResult);
    }

    return res.status(200).json({ userId, message: formattedResponse });
  } catch (error) {
    console.error(
      'Error connecting to OpenAI or fetching weather data:',
      error
    );
    return res.status(500).json({ error: 'Error processing the request' });
  }
});

router.post('/extract-clothes', async (req: Request, res: Response) => {
  const { promptGptResponse, userId } = req.body;

  if (!promptGptResponse || !userId) {
    return res.status(400).json({
      error: 'Prompt GPT response and User ID are required.',
    });
  }

  try {
    const responseText = promptGptResponse || '';

    const clothingLines = responseText
      .split('\n')
      .filter((line: any) =>
        line.match(/\*\*(Top|Bottom|Footwear|Accessories):\*\*|Your/i)
      );

    console.log('Clothing Lines:', clothingLines);

    const parsingPrompt = `
      Extract all clothing items mentioned in the following lines. Categorize them into two arrays:
      1. "yourClothes" - Clothing items that start with "Your" or are labeled with "Your" in Markdown links.
      2. "otherClothes" - Clothing items that are mentioned but do not have "Your".

      For each item, extract:
      - "description": The full description of the clothing item (e.g., "Black loafers or casual sneakers").
      - "imageUrl": The URL of the image if present in Markdown format (e.g., ![Your Black turtle neck](URL)).
      - "category": The category (e.g., "Top", "Bottom", "Footwear", "Accessories") if mentioned.

      Respond with a JSON object:
      {
        "yourClothes": [{ "description": "...", "imageUrl": "...", "category": "..." }],
        "otherClothes": [{ "description": "...", "imageUrl": "...", "category": "..." }]
      }

      Input:
      ${JSON.stringify(clothingLines)}
    `;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'system', content: parsingPrompt }],
    });

    let parsedClothes;
    const gptMessageContent = gptResponse.choices[0]?.message?.content || '';
    const sanitizedContent = gptMessageContent
      .replace(/```json|```/g, '')
      .trim();

    try {
      parsedClothes = JSON.parse(sanitizedContent);
    } catch (jsonError) {
      console.error('Error parsing GPT response:', jsonError);
      console.error('Sanitized Content:', sanitizedContent);
      return res.status(500).json({
        error: 'Failed to parse GPT response as JSON.',
      });
    }

    console.log('Parsed Clothes:', parsedClothes);

    const { yourClothes, otherClothes } = parsedClothes;

    if (otherClothes && otherClothes.length > 0) {
      const userResult = await getUserById(userId);
      if (userResult.status !== 200) {
        return res.status(userResult.status).json(userResult);
      }

      const user = userResult.user;
      const { budget_min, budget_max, gender }: any = user;

      const itemsToScrape = otherClothes.map((item: any) => {
        const { description, category } = item;

        const queryParts = [
          gender === 'Male' ? 'Men' : 'Women',
          category,
          description,
        ];

        const rawSearchQuery = queryParts
          .filter(Boolean)
          .join(' ')
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .trim();

        return { rawSearchQuery };
      });

      console.log('Initial Search Queries:', itemsToScrape);

      const optimizedQueries = await Promise.all(
        itemsToScrape.map(async ({ rawSearchQuery }: any) => {
          const searchQueryOptimizationPrompt = `
            Refine the following search query for simplicity and accuracy - as if you are searching for an item in an online store. Remove unnecessary words and focus on the key words, don't be too specific (e.g., "Men black sneakers casual"):
            Input Query: "${rawSearchQuery}"
          `;

          const gptOptimizationResponse = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
              { role: 'system', content: searchQueryOptimizationPrompt },
            ],
          });

          return gptOptimizationResponse?.choices[0]?.message?.content?.trim();
        })
      );

      console.log('Optimized Search Queries:', optimizedQueries);

      if (optimizedQueries.length > 0) {
        const browser = await puppeteer.launch({
          args: [
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--single-process',
            '--no-zygote',
          ],
          executablePath:
            process.env.NODE_ENV === 'production'
              ? process.env.PUPPETEER_EXECUTABLE_PATH
              : puppeteer.executablePath(),
          headless: true,
        });
        const searchResults = await Promise.all(
          optimizedQueries.map(async (searchQuery) => {
            const encodedQuery = encodeURIComponent(searchQuery);
            const budgetRange = `price=${budget_min}-${budget_max}`;
            const searchUrl = `https://www.zalora.com.ph/search?q=${encodedQuery}`;

            const page = await browser.newPage();
            await page.goto(searchUrl, { timeout: 0 });

            const products = await page.evaluate(() => {
              const productElements = document.querySelectorAll(
                'a[data-test-id="productLink"]'
              );
              const productData: Array<{
                name: string;
                price: string;
                originalPrice?: string;
                discount?: string;
                image: string;
                productUrl: string;
                brand: string;
              }> = [];

              productElements.forEach((element) => {
                const name =
                  element
                    .querySelector('div[data-test-id="productTitle"]')
                    ?.textContent?.trim() || '';
                const price =
                  element
                    .querySelector(
                      'div[data-test-id="productPrice"] .font-bold'
                    )
                    ?.textContent?.trim() || '';
                const originalPrice =
                  element
                    .querySelector('div[data-test-id="originalPrice"]')
                    ?.textContent?.trim() || '';
                const discount =
                  element
                    .querySelector('div[data-test-id="discountPercentage"]')
                    ?.textContent?.trim() || '';
                const image =
                  element.querySelector('img')?.getAttribute('src') || '';
                const productUrl = element.getAttribute('href') || '';
                const brand =
                  element
                    .querySelector('span[data-test-id="productBrandName"]')
                    ?.textContent?.trim() || '';

                if (name && price && productUrl) {
                  productData.push({
                    name,
                    price,
                    originalPrice,
                    discount,
                    image,
                    productUrl,
                    brand,
                  });
                }
              });

              return productData;
            });

            await page.close();

            return {
              piece: searchQuery,
              searchUrl,
              products: products.slice(0, 2),
            };
          })
        );

        await browser.close();

        return res.status(200).json({
          yourClothes,
          otherClothes,
          searchResults,
        });
      }
    }

    return res.status(200).json({ yourClothes, otherClothes });
  } catch (error: any) {
    console.error(
      'Error extracting clothes and scraping items:',
      error.message
    );
    return res.status(500).json({
      error: 'An error occurred while extracting clothes and scraping items.',
    });
  }
});

router.post('/retrieve-user-sessions', async (req: Request, res: Response) => {
  const { userId } = req.body;

  const result = await retrieveSessionChat(userId);

  return res.status(result.status).json(result);
});

router.post(
  '/generate-prompt-suggestions',
  async (req: Request, res: Response) => {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    try {
      const promptInstruction = `
      Based on the user's message: "${userMessage}", generate three engaging and helpful suggestions for what the user could ask a virtual stylist assistant. 
      Each suggestion should directly state a possible user query in one sentence, without additional phrasing like "How about asking" or "Why not inquire." 
      Ensure the suggestions are clear, relevant to fashion and styling, and encourage interaction with the assistant.
    `;

      const openaiResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a virtual stylist assistant helping generate engaging suggestions for user interactions about fashion and outfits.',
          },
          { role: 'user', content: promptInstruction },
        ],
      });

      const gptResponse = openaiResponse.choices[0]?.message?.content || null;

      if (!gptResponse) {
        return res.status(500).json({ error: 'No valid response from GPT' });
      }

      // Format the response
      const promptSuggestions = gptResponse
        .split('\n')
        .map((line) => line.trim().replace(/^\d+\.\s*/, '')) // Remove numbering
        .filter((line) => line.length > 0 && !line.startsWith('*')) // Remove irrelevant lines
        .map((line) =>
          line
            .replace(
              /^How about asking,|^Why not inquire,|^Feel free to ask,/,
              ''
            )
            .trim()
        ) // Remove leading phrases
        .slice(0, 3); // Limit to three suggestions

      return res.status(200).json({ suggestions: promptSuggestions });
    } catch (error) {
      console.error('Error generating prompt suggestions:', error);
      return res
        .status(500)
        .json({ error: 'Error generating prompt suggestions' });
    }
  }
);

router.delete(
  '/delete-chat-session-messages',
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const result = await deleteChatSessionMessages(userId);

    return res.status(result.status).json(result);
  }
);

export default router;

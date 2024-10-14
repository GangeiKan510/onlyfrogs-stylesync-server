import { Request, Response, Router } from 'express';
import {
  deleteChatSessionMessages,
  retrieveSessionChat,
} from '../../controllers/chat';
import OpenAI from 'openai';
import axios from 'axios';
import { sendMessage } from '../../controllers/chat';
import { getUserById } from '../../controllers/user';

const router = Router();

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

    let lat: string | undefined;
    let lon: string | undefined;
    let locationName: string | undefined;
    let weatherDescription: string | undefined;
    let temperature: string | undefined;
    let windSpeed: string | undefined;

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
      - **${item.name}**:
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
        Please prioritize these items when suggesting outfits. If essential items are missing, feel free to suggest generic options to pair with them. Ensure that all chosen clothing from the closet includes its images using markdown image syntax like \`![Item Name](image_url)\`.
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
    - Include markdown image links for the closet items.
    - For any generic items, list them without images.
    `;

    const fullConversation = [
      { role: 'system', content: systemMessageContent },
      ...previousMessages,
      { role: 'user', content: userMessage },
    ];

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

router.post('/retrieve-user-sessions', async (req: Request, res: Response) => {
  const { userId } = req.body;

  const result = await retrieveSessionChat(userId);

  return res.status(result.status).json(result);
});

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

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
        The user has ${userClothes.length} clothing item(s):
        ${userClothes
          .map(
            (item) => `
            - ${item.name}: 
              - Name: ${item.name}
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
        Suggest an outfit using their closet items, and only suggest generic options for missing essential items, considering the weather: 
        Weather: ${weatherDescription}, Temperature: ${temperature}°C, Wind Speed: ${windSpeed} m/s.
      `;
    } else {
      clothingMessage = `
        The user has no clothing items in their closet. 
        Suggest a complete outfit based on the current weather conditions: 
        Weather: ${weatherDescription}, Temperature: ${temperature}°C, Wind Speed: ${windSpeed} m/s.
      `;
    }

    const systemMessageContent = `
    You are a virtual stylist assistant named Ali.
    Always prioritize and suggest clothes from the user's closet before considering any other items. Only suggest items outside their closet if essential items are missing.
    - User Details: ${user?.first_name} ${user?.last_name}
    - Location: ${locationName || 'unknown'}
    - Skin Tone: ${user?.skin_tone_classification}
    - Clothing Colors That Complement: ${user?.skin_tone_complements}
    - Current Weather: ${weatherDescription}, Temperature: ${temperature}°C, Wind Speed: ${windSpeed} m/s
    - Height: ${user?.height} cm, Weight: ${user?.weight} kg
    - Style preferences: ${user?.style_preferences.join(', ')}
    - Favorite colors: ${user?.favorite_colors.join(', ')}
    - Preferred brands: ${user?.preferred_brands.join(', ')}
    - Body type: ${user?.body_type}
    - Season: ${user?.season}
    - Budget: ${user?.budget_min} - ${user?.budget_max}
    ${clothingMessage}

    Please provide the response in markdown format, including image URLs for the suggested outfits. Ensure that the outfits prioritize the user's closet items. Use markdown image tags for any outfit suggestions like this: ![Outfit](image_url). 
  `;

    const fullConversation = [
      { role: 'system', content: systemMessageContent },
      ...previousMessages,
      { role: 'user', content: userMessage },
    ];

    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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

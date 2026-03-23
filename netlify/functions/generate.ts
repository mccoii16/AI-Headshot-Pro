import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { imageBase64, mimeType, stylePrompt } = JSON.parse(event.body || '{}');

    if (!imageBase64 || !stylePrompt) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // 1. Describe the user's selfie using Gemini (Free text model)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/jpeg',
          }
        },
        {
          text: "Describe this person's physical appearance in detail (gender, age, ethnicity, hair color/style, facial features, expression, glasses/accessories). Do not describe the background or current clothing. Keep it concise."
        }
      ]
    });

    const physicalDescription = response.text;

    // 2. Combine description with the requested style for Pollinations
    const finalPrompt = `A professional headshot of ${physicalDescription}. ${stylePrompt}`;

    // 3. Generate image via Pollinations.ai
    // Adding a random seed to avoid caching issues if the same prompt is generated twice
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: pollinationsUrl, description: physicalDescription }),
    };
  } catch (error: any) {
    console.error("Netlify Function Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Internal Server Error' }) };
  }
};

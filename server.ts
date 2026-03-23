import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Mimic the Netlify function for local AI Studio preview
  app.post('/.netlify/functions/generate', async (req, res) => {
    try {
      const { imageBase64, mimeType, stylePrompt } = req.body;

      if (!imageBase64 || !stylePrompt) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      console.log("Using API Key:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + "..." : "undefined");
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
      const finalPrompt = `A professional headshot of ${physicalDescription}. ${stylePrompt}`;
      const seed = Math.floor(Math.random() * 1000000);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

      res.status(200).json({ imageUrl: pollinationsUrl, description: physicalDescription });
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

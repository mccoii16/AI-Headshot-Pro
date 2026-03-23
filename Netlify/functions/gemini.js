import { GoogleGenAI } from '@google/genai'; // Using the latest 2026 SDK

export default async (req, context) => {
  const { prompt } = await req.json();

  // The Gateway automatically provides auth; no key needed here!
  const ai = new GoogleGenAI({}); 

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview', // Or your preferred version
    contents: prompt 
  });

  return Response.json(response);
};

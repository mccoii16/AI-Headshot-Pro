const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  try {
    const { base64Data, mimeType, stylePrompt } = JSON.parse(event.body);

    // 1. Initialize Gemini 1.5 Flash (The "Eyes")
    // Make sure GEMINI_API_KEY is set in your Netlify Environment Variables!
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 2. Ask Gemini to describe the person in the photo
    const visionPrompt = "Describe this person for a high-quality photo generation prompt. Mention their approximate age, gender, ethnicity, hair style/color, and any distinct facial features like glasses or a beard. Keep the description under 40 words.";
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      },
    };

    const visionResult = await model.generateContent([visionPrompt, imagePart]);
    const personDescription = visionResult.response.text();

    // 3. Combine the description with the Professional Style
    const finalPrompt = `${stylePrompt}. The person is a ${personDescription}. Hyper-realistic, 8k, professional photography.`;

    // 4. Generate the URL for Pollinations (The "Camera")
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(finalPrompt)}?model=flux&width=1024&height=1280&nologo=true&seed=${seed}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ url: imageUrl }),
    };
  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

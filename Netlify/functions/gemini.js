// netlify/functions/generate-headshot.js
exports.handler = async (event) => {
  try {
    const { prompt, style } = JSON.parse(event.body);

    // 1. Construct a professional "Headshot" prompt
    const enhancedPrompt = `Professional corporate headshot of a person, ${style} style, high quality, studio lighting, 8k resolution, realistic: ${prompt}`;

    // 2. Pollinations.ai generates images via a simple URL (No API Key needed!)
    // We use the 'flux' model which is the 2026 standard for high-quality free images.
    const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(enhancedPrompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        url: imageUrl,
        message: "Image generated successfully using Pollinations.ai" 
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate image: " + error.message }),
    };
  }
};

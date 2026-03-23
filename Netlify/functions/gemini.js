exports.handler = async (event) => {
  try {
    const { stylePrompt } = JSON.parse(event.body);

    // Create a random seed so every generation looks slightly different
    const seed = Math.floor(Math.random() * 1000000);

    // This URL generates a 100% free image based on your style
    const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(stylePrompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ url: imageUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

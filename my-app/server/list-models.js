const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('Fetching available models...\n');
    const models = await genAI.listModels();
    
    console.log('Available models:');
    for (const model of models.models) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();

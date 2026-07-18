import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    const models = await ai.models.list();
    for (const m of models) {
      if (m.name.includes('flash') || m.name.includes('gemini')) {
        console.log(m.name, m.supportedGenerationMethods);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

listModels();

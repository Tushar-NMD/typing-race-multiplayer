import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const generatePrompt = async (req: Request, res: Response) => {
  try {
    // Initialize inside the function so dotenv has definitely loaded GEMINI_API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const topic = req.query.topic as string || 'random';
    const difficulty = req.query.difficulty as string || 'medium';

    let lengthInstruction = '30 to 40 words';
    if (difficulty === 'easy') lengthInstruction = '15 to 25 words';
    if (difficulty === 'hard') lengthInstruction = '50 to 60 words';

    const prompt = `Generate a single paragraph of text about "${topic}". The text should be exactly ${lengthInstruction} long. It will be used for a typing speed test, so ensure the sentences are grammatically correct and flow well. Do not include any title, introductory text, or quotes, just the plain text paragraph itself.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });

    const generatedText = response.text?.trim() || "Failed to generate text. The quick brown fox jumps over the lazy dog.";

    res.json({ success: true, text: generatedText });
  } catch (error: any) {
    console.error('Error generating AI prompt:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate AI prompt', error: error.message });
  }
};

export const generateCoachFeedback = async (req: Request, res: Response) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { wpm, accuracy, missedKeys, difficulty } = req.body;

    let lengthInstruction = '30 to 40 words';
    if (difficulty === 'easy') lengthInstruction = '15 to 25 words';
    if (difficulty === 'hard') lengthInstruction = '50 to 60 words';

    // Format missed keys string
    const missedKeysStr = Object.entries(missedKeys || {})
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([key, count]) => `'${key}' (${count} times)`)
      .join(', ');

    const prompt = `You are an expert typing coach. A user just finished a typing race with ${wpm} WPM and ${accuracy}% accuracy. 
The keys they missed the most were: ${missedKeysStr}.

Generate a JSON response containing two fields:
1. "feedback": A short, encouraging 2-sentence feedback tip tailored to the keys they missed and their WPM.
2. "practiceText": A brand new paragraph of text exactly ${lengthInstruction} long that specifically includes many words containing the letters they missed most frequently, so they can practice them. DO NOT include quotes or markdown formatting for the practice text.

Respond ONLY with valid JSON. Do not include markdown code block syntax like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });

    let rawText = response.text?.trim() || "{}";
    if (rawText.startsWith('\`\`\`json')) rawText = rawText.substring(7);
    if (rawText.startsWith('\`\`\`')) rawText = rawText.substring(3);
    if (rawText.endsWith('\`\`\`')) rawText = rawText.substring(0, rawText.length - 3);

    const parsed = JSON.parse(rawText.trim());

    res.json({ 
      success: true, 
      feedback: parsed.feedback || "Keep practicing! Accuracy leads to speed.", 
      practiceText: parsed.practiceText || "The quick brown fox jumps over the lazy dog." 
    });
  } catch (error: any) {
    console.error('Error generating AI coach feedback:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate AI coach feedback', error: error.message });
  }
};

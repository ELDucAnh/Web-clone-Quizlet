export const maxDuration = 60; // Allow max 60s for Vercel Hobby

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { words } = await req.json();

    if (!words || words.length === 0) {
      return NextResponse.json({ error: 'Missing words' }, { status: 400 });
    }

    const prompt = `You are an expert IELTS Listening examiner. 
Create a challenging IELTS Listening Section 4 practice exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Create exactly ONE academic lecture/presentation and EXACTLY 10 multiple-choice questions.
- The lecture MUST be a complex academic monologue given by a SINGLE speaker (e.g., a university professor or expert).
- The lecture MUST be long (around 200-300 words).
- The lecture MUST naturally incorporate as many of the provided vocabulary words as possible.
- The 10 questions MUST test synthesis of information, inference, and identifying main ideas (like IELTS Listening Section 4). They must NOT be simple word-matching questions.
- Each question must have exactly 4 options.
- The output MUST be a valid JSON object. Do not wrap in markdown \`\`\`json.

Format:
{
  "dialogue": [
    { "speaker": "Professor", "text": "The entire academic lecture text here..." }
  ],
  "questions": [
    {
      "question": "What is the speakers' main conclusion about X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
    // EXACTLY 10 QUESTIONS
  ]
}

GENERATE THE JSON NOW.`;

    const fallbackModels = [
      'gemini-flash-latest',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-pro-latest'
    ];

    let result;
    let lastError;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        if (result) break;
      } catch (e: any) {
        lastError = e;
        console.warn(`Model ${modelName} failed: ${e.message}`);
      }
    }

    if (!result) {
      throw lastError || new Error('All models failed');
    }

    const responseText = result.response.text();
    let jsonStr = responseText;
    
    // Tìm vị trí của dấu { đầu tiên và } cuối cùng để tránh các chữ rác xung quanh
    const startIndex = jsonStr.indexOf('{');
    const endIndex = jsonStr.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      jsonStr = jsonStr.substring(startIndex, endIndex + 1);
    } else {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    const listeningPractice = JSON.parse(jsonStr);

    return NextResponse.json(listeningPractice);

  } catch (error: any) {
    console.error('Error generating listening:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

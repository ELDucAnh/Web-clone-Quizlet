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
Create a challenging IELTS Listening Section 3 practice exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Create exactly ONE dialogue and EXACTLY 10 multiple-choice questions.
- The dialogue MUST be a complex academic discussion between 2 or 3 speakers (e.g., a tutor and two students).
- The dialogue MUST be long (around 150-250 words, at least 10 turns).
- The dialogue MUST naturally incorporate as many of the provided vocabulary words as possible.
- The 10 questions MUST test synthesis of information, inference, identifying speaker attitudes, and understanding agreements/disagreements (like IELTS Listening Section 3). They must NOT be simple word-matching questions.
- Each question must have exactly 4 options.
- The output MUST be a valid JSON object. Do not wrap in markdown \`\`\`json.

Format:
{
  "dialogue": [
    { "speaker": "Tutor", "text": "..." },
    { "speaker": "Student A", "text": "..." }
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
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const listeningPractice = JSON.parse(jsonStr);

    return NextResponse.json(listeningPractice);

  } catch (error: any) {
    console.error('Error generating listening:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const prompt = `You are an expert IELTS Reading examiner. 
Create a highly complex IELTS Reading Passage 3 practice exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Create exactly ONE reading passage and EXACTLY 10 multiple-choice questions.
- The reading passage MUST be academic, highly complex, and contain exactly 6 paragraphs (mimicking IELTS Reading Passage 3).
- The passage MUST naturally incorporate as many of the provided vocabulary words as possible.
- The 10 questions MUST test deep comprehension, inference, author's tone/purpose, and detailed synthesis.
- Each question must have exactly 4 options.
- Each question MUST include an "explanation" field that explains WHY the correct answer is right and why others might be wrong.
- The output MUST be a valid JSON object. Do not wrap in markdown \`\`\`json.

Format:
{
  "title": "Title of the passage",
  "paragraphs": [
    "Paragraph 1 text...",
    "Paragraph 2 text...",
    "Paragraph 3 text...",
    "Paragraph 4 text...",
    "Paragraph 5 text...",
    "Paragraph 6 text..."
  ],
  "questions": [
    {
      "question": "What is the author's main argument in the third paragraph?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Option A is correct because... Option B is incorrect because..."
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
      // Fallback fallback
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    const readingPractice = JSON.parse(jsonStr);

    return NextResponse.json(readingPractice);

  } catch (error: any) {
    console.error('Error generating reading:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

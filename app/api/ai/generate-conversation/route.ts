export const maxDuration = 299; // Allow max 60s for Vercel Hobby

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { words } = await req.json();

    if (!words || words.length === 0) {
      return NextResponse.json({ error: 'Missing words' }, { status: 400 });
    }

    const prompt = `You are an expert English teacher. 
Create an interactive 10-question English learning exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Generate EXACTLY 10 items.
- The items must alternate randomly between 2 types: "repeat_sentence" and "translate_typing".
- Every item MUST incorporate at least one vocabulary word from the list above.
- The output MUST be a JSON array of objects. Do not wrap in markdown \`\`\`json.

Format for each type:

1. Type "repeat_sentence" (User listens and repeats to practice pronunciation):
{
  "type": "repeat_sentence",
  "speaker": "A",
  "text": "A natural English sentence using the vocabulary."
}

2. Type "translate_typing" (User reads a complex Vietnamese sentence and types the English translation):
- The sentences MUST be highly complex, academic, and structured like IELTS Writing Task 2 arguments or complex ideas.
{
  "type": "translate_typing",
  "vietnamese": "Câu tiếng Việt học thuật, phức tạp cần dịch ra tiếng Anh.",
  "expectedEnglish": "The expected complex English translation using the vocabulary."
}

GENERATE EXACTLY 10 ITEMS AS A JSON ARRAY.`;

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
    
    // Tìm vị trí của dấu [ đầu tiên và ] cuối cùng (vì đây là Array)
    const startIndex = jsonStr.indexOf('[');
    const endIndex = jsonStr.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      jsonStr = jsonStr.substring(startIndex, endIndex + 1);
    } else {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    const conversation = JSON.parse(jsonStr);

    return NextResponse.json({ conversation });

  } catch (error: any) {
    console.error('Error generating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

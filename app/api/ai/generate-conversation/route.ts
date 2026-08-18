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
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ];

    let result;
    let lastError;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
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

    // Parse JSON
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const conversation = JSON.parse(jsonStr);

    return NextResponse.json({ conversation });

  } catch (error: any) {
    console.error('Error generating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

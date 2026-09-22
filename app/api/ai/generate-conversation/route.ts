export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { words } = await req.json();

    if (!words || words.length === 0) {
      return NextResponse.json({ error: 'Missing words' }, { status: 400 });
    }

    const prompt = `You are an expert IELTS Writing Task 2 coach. Output valid JSON only. Ensure exactly 10 items with 2 distinct task2Prompt values (5 items each).

Generate exactly 10 translation exercises based on these vocabulary words: ${words.join(', ')}

STRICT RULES:
- Pick exactly 2 different IELTS Task 2 essay topics (5 sentences per topic).
- For topic 1: questions 1-5 (indices 0-4). For topic 2: questions 6-10 (indices 5-9).
- Each sentence covers a DIFFERENT argument/sub-point of that topic (introduction, body point 1, body point 2, concession, conclusion etc).
- The Vietnamese sentence must be a natural, complex academic sentence related to that argument.
- The English translation must be genuinely IELTS Writing Task 2 quality (band 7+): complex grammar, good collocations, cohesion.
- Incorporate vocabulary words naturally.

Output ONLY this JSON structure:
{
  "conversation": [
    {
      "type": "translate_typing",
      "task2Prompt": "Full IELTS Task 2 question (2-3 sentences, as it would appear in the exam)",
      "argument": "Brief label for this sub-point, e.g. 'Body 1: Main argument for...' or 'Introduction' or 'Counter-argument'",
      "vietnamese": "Câu tiếng Việt học thuật phức tạp cần dịch ra tiếng Anh.",
      "expectedEnglish": "The expected band 7+ English translation using the vocabulary."
    }
  ]
}`;

    const fallbackModels = [
      'gemini-flash-latest',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-pro-latest'
    ];
    let parsedData: any;
    let errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        if (result) {
          let responseText = result.response.text();
          responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            responseText = responseText.substring(firstBrace, lastBrace + 1);
          }

          parsedData = JSON.parse(responseText);
          console.log(`[generate-conversation] Đã dùng thành công model: ${modelName}`);
          break;
        }
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
        console.warn(`[generate-conversation] Model ${modelName} failed: ${e.message}`);
      }
    }

    if (!parsedData) {
      throw new Error('All Gemini models failed. Details: ' + errors.join(' | '));
    }

    const conversation = Array.isArray(parsedData)
      ? parsedData
      : (parsedData.conversation || parsedData.items || Object.values(parsedData)[0]);

    return NextResponse.json({ conversation });

  } catch (error: any) {
    console.error('Error generating writing practice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

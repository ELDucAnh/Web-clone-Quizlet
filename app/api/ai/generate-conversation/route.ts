export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { words } = await req.json();

    if (!words || words.length === 0) {
      return NextResponse.json({ error: 'Missing words' }, { status: 400 });
    }

    const prompt = `You are an expert IELTS Writing Task 2 coach. Generate exactly 10 translation exercises based on these vocabulary words: ${words.join(', ')}

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

    const fallbackModels = ['groq/compound', 'groq/compound-mini'];
    let completion;
    let errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert IELTS Writing Task 2 coach. Output valid JSON only. Ensure exactly 10 items with 2 distinct task2Prompt values (5 items each).' },
            { role: 'user', content: prompt }
          ],
          model: modelName,
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        });
        if (completion) break;
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
        console.warn(`Groq Model ${modelName} failed: ${e.message}`);
      }
    }

    if (!completion) {
      throw new Error('All Groq models failed. Details: ' + errors.join(' | '));
    }

    const responseText = completion.choices[0]?.message?.content || '';
    const parsedData = JSON.parse(responseText);
    const conversation = Array.isArray(parsedData)
      ? parsedData
      : (parsedData.conversation || parsedData.items || Object.values(parsedData)[0]);

    return NextResponse.json({ conversation });

  } catch (error: any) {
    console.error('Error generating writing practice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

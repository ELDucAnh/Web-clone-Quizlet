export const maxDuration = 60; // Allow max 60s for Vercel Hobby

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

    const prompt = `Create an interactive 10-question English learning exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Generate EXACTLY 10 items.
- The items must alternate randomly between 2 types: "repeat_sentence" and "translate_typing".
- Every item MUST incorporate at least one vocabulary word from the list above.
- The output MUST be a valid JSON object with a single key "conversation" containing the array of 10 items.

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
}`;

    const fallbackModels = ['groq/compound', 'groq/compound-mini'];
    let completion;
    let errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are an expert English teacher. Output valid JSON only." },
            { role: "user", content: prompt }
          ],
          model: modelName,
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: "json_object" }
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

    const responseText = completion.choices[0]?.message?.content || "";
    
    // Parse JSON
    const parsedData = JSON.parse(responseText);

    // Xử lý fallback trong trường hợp Groq trả về object thay vì mảng trực tiếp (vì đã ép json_object)
    const conversation = Array.isArray(parsedData) ? parsedData : (parsedData.conversation || parsedData.items || Object.values(parsedData)[0]);

    return NextResponse.json({ conversation });

  } catch (error: any) {
    console.error('Error generating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

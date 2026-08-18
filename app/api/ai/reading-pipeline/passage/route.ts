import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export const maxDuration = 60; // Allow max 60s for Vercel Hobby

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { words, previousContext, part } = await req.json();

    let prompt = "";
    if (part === 1) {
      prompt = `Write the Title and the FIRST 2 paragraphs of a highly academic, C2 proficiency level reading passage.
Vocabulary words to include: ${words.join(', ')}

IMPORTANT RULES:
- Generate exactly 1 title and exactly 2 long, complex paragraphs.
- Output MUST be a valid JSON object.
CRITICAL JSON RULE: DO NOT use literal newlines inside strings. Keep each paragraph as a single continuous string.

Format:
{
  "title": "[Insert an academic title here]",
  "paragraphs": ["[Write the full, lengthy first paragraph here]", "[Write the full, lengthy second paragraph here]"]
}`;
    } else if (part === 2) {
      prompt = `Continue the following highly academic reading passage. 
Previous context:
${previousContext}

Vocabulary words to include: ${words.join(', ')}

IMPORTANT RULES:
- Generate EXACTLY 2 new paragraphs that logically continue the passage above.
- Do NOT repeat the previous context. Just write the next 2 paragraphs.
- Output MUST be a valid JSON object.
CRITICAL JSON RULE: DO NOT use literal newlines inside strings. Keep each paragraph as a single continuous string.

Format:
{
  "paragraphs": ["[Write the full, lengthy third paragraph here]", "[Write the full, lengthy fourth paragraph here]"]
}`;
    } else {
      prompt = `Conclude the following highly academic reading passage.
Previous context:
${previousContext}

Vocabulary words to include: ${words.join(', ')}

IMPORTANT RULES:
- Generate EXACTLY 2 final paragraphs that conclude the passage above.
- Do NOT repeat the previous context. Just write the next 2 paragraphs.
- Output MUST be a valid JSON object.
CRITICAL JSON RULE: DO NOT use literal newlines inside strings. Keep each paragraph as a single continuous string.

Format:
{
  "paragraphs": ["[Write the full, lengthy fifth paragraph here]", "[Write the full, lengthy sixth paragraph here]"]
}`;
    }

    const fallbackModels = ['qwen/qwen3.6-27b', 'openai/gpt-oss-20b', 'groq/compound-mini', 'groq/compound'];
    let completion;
    let errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are an expert IELTS Reading examiner. Output valid JSON only." },
            { role: "user", content: prompt }
          ],
          model: modelName,
          temperature: 0.3,
          max_tokens: 800
        });
        if (completion) break;
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
      }
    }

    if (!completion) {
      throw new Error('All Groq models failed. Details: ' + errors.join(' | '));
    }

    const responseText = completion.choices[0]?.message?.content || "";
    let data;
    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : responseText;
      data = JSON.parse(jsonStr);
    } catch (parseError: any) {
      if (completion.choices[0]?.finish_reason === 'length') {
        throw new Error("Bị ngắt ngang do Token Limit.");
      }
      throw new Error("Lỗi rách file JSON: " + parseError.message);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

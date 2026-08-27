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

    const prompt = `Create a realistic, engaging English conversation between TWO speakers based on the vocabulary words below.
Vocabulary to incorporate: ${words.slice(0, 20).join(', ')}

STRICT REQUIREMENTS:
- The conversation MUST be LONG — at least 600 words total across all turns (this equals roughly 4-5 minutes of natural speech).
- TWO speakers only: "Alex" and "Jamie". They are friends or colleagues having an in-depth discussion.
- The topic should be interesting and relatable: could be about technology, society, travel, science, career, or personal growth.
- Naturally weave in as many vocabulary words as possible without forcing them.
- Each speaker turn must be SUBSTANTIAL (3-6 sentences minimum). No one-liners.
- The conversation must have a clear arc: opening → developing ideas → deeper discussion → conclusion/reflection.
- Make it feel AUTHENTIC — include natural transitions, agreements, disagreements, follow-up questions.
- Write a concise "keyPoints" array (6-8 bullet points) summarizing the main ideas discussed. This will be used to evaluate user summaries.

Output ONLY valid JSON:
{
  "topic": "A short topic title (max 8 words)",
  "dialogue": [
    { "speaker": "Alex", "text": "..." },
    { "speaker": "Jamie", "text": "..." }
  ],
  "keyPoints": [
    "Key point 1 from the conversation",
    "Key point 2 from the conversation"
  ]
}`;

    const fallbackModels = ['groq/compound', 'groq/compound-mini', 'qwen/qwen3.6-27b'];
    let completion;
    let errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are a skilled English dialogue writer. Output valid JSON only. Write long, detailed, natural conversations.' },
            { role: 'user', content: prompt }
          ],
          model: modelName,
          temperature: 0.8,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        });
        if (completion) break;
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
        console.warn(`Model ${modelName} failed: ${e.message}`);
      }
    }

    if (!completion) {
      throw new Error('All models failed: ' + errors.join(' | '));
    }

    const responseText = completion.choices[0]?.message?.content || '{}';
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Generate Dialogue Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

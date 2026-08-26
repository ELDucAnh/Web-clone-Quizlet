export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { userTranslation, expectedEnglish, vietnameseSentence } = await req.json();

    if (!userTranslation || !expectedEnglish) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `You are an expert English teacher analyzing a student's Vietnamese-to-English translation.

Vietnamese sentence: "${vietnameseSentence}"
Expected English: "${expectedEnglish}"
Student's translation: "${userTranslation}"

Analyze the student's translation and return a JSON object with:
1. "score": integer 0–100 rating the translation quality
2. "grammarErrors": array of objects, each with:
   - "original": the incorrect phrase/word from student's text
   - "correction": the corrected version
   - "explanation": brief explanation in Vietnamese (1 sentence)
3. "vocabularyTips": array of objects (max 3), each with:
   - "studentWord": word/phrase student used
   - "betterAlternative": a more natural/academic alternative
   - "reason": why it's better (in Vietnamese, 1 sentence)
4. "structureFeedback": string — overall feedback on sentence structure in Vietnamese (2-3 sentences)
5. "correctedSentence": the fully corrected version of the student's translation

IMPORTANT:
- Keep all feedback in Vietnamese for easy understanding.
- Be encouraging but precise.
- If the translation is good, say so in structureFeedback.
- Only flag real grammar errors, not stylistic choices.
- Output ONLY valid JSON, no markdown.

Format:
{
  "score": 75,
  "grammarErrors": [
    { "original": "...", "correction": "...", "explanation": "..." }
  ],
  "vocabularyTips": [
    { "studentWord": "...", "betterAlternative": "...", "reason": "..." }
  ],
  "structureFeedback": "...",
  "correctedSentence": "..."
}`;

    const fallbackModels = ['groq/compound', 'groq/compound-mini', 'qwen/qwen3.6-27b'];
    let completion;
    let errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert English teacher. Output valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          model: modelName,
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        });
        if (completion) break;
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
      }
    }

    if (!completion) {
      throw new Error('All models failed: ' + errors.join(' | '));
    }

    const responseText = completion.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(responseText);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('[Analyze Translation Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

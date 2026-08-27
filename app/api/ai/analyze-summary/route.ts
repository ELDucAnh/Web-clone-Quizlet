export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { userSummary, keyPoints, topic, fullTranscript } = await req.json();

    if (!userSummary || !keyPoints) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `You are an English listening comprehension evaluator. A student just listened to a conversation about "${topic}" and wrote a summary in Vietnamese or English.

CONVERSATION KEY POINTS (what they should have understood):
${keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

STUDENT'S SUMMARY:
"${userSummary}"

Evaluate the student's summary and return a JSON object with:

1. "overallScore": integer 0-100
2. "comprehensionLevel": one of "Xuất sắc", "Tốt", "Trung bình", "Cần cố gắng hơn"
3. "caughtPoints": array of strings — key points the student DID capture correctly (in Vietnamese)
4. "missedPoints": array of strings — important points they MISSED or got wrong (in Vietnamese)
5. "languageFeedback": object with:
   - "strengths": array of strings — good things about their summary writing (in Vietnamese)
   - "improvements": array of strings — specific writing/vocabulary suggestions (in Vietnamese)
6. "vocabularyUsage": array of objects — vocabulary words they used well or could have used:
   - { "word": "...", "status": "used_well" | "missed_opportunity", "tip": "..." }  (tip in Vietnamese)
7. "encouragement": string — a motivating message in Vietnamese (1-2 sentences)
8. "suggestedSummary": string — a model summary in English (2-3 sentences showing what a good answer looks like)

IMPORTANT:
- Be encouraging but honest.
- Keep all feedback in Vietnamese (except suggestedSummary which is in English).
- If summary is in Vietnamese, that's fine — evaluate content comprehension, not the language they wrote in.
- Output ONLY valid JSON.`;

    const fallbackModels = ['groq/compound', 'groq/compound-mini', 'qwen/qwen3.6-27b'];
    let completion;
    let errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert English listening comprehension evaluator. Output valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          model: modelName,
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
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
    console.error('[Analyze Summary Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

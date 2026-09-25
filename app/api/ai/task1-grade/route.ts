export const maxDuration = 30;

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { sentence, sentenceIndex, chartType, chartContext, chartTitle } = await req.json();

    if (!sentence || !chartType || !chartContext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sentenceRole = getSentenceRole(sentenceIndex);

    const prompt = `You are an expert IELTS Academic Writing Task 1 examiner. Output valid JSON only.

You are evaluating ONE sentence written by a student to describe an IELTS Task 1 chart/diagram.

Chart type: ${chartType}
Chart title: ${chartTitle || ''}
Chart description: ${chartContext}
Sentence number: ${sentenceIndex + 1} (${sentenceRole})

Student's sentence: "${sentence}"

Evaluate this single sentence for IELTS Task 1 Academic Writing quality.

Consider:
1. Is the language appropriate for Task 1 (formal, academic, objective)?
2. Does it describe data accurately and in a way that makes sense for this chart type?
3. Is the grammar correct?
4. Is the vocabulary appropriate (precise, varied, academic)?
5. Does it serve its intended function as sentence #${sentenceIndex + 1} (${sentenceRole})?

Return a JSON object with:
- "score": integer 0–100 (80+ to pass to the next sentence)
- "grammarErrors": array — ALL grammar mistakes. Each: { "original": "...", "correction": "...", "explanation": "..." (in Vietnamese) }
- "vocabularyTips": array — words/phrases that can be improved. Each: { "studentWord": "...", "betterAlternative": "...", "reason": "..." (in Vietnamese) }
- "structureFeedback": string — overall feedback on this specific sentence in Vietnamese (2–3 sentences). Be specific about whether it works well for Task 1.
- "correctedSentence": the fully corrected, improved version of the student's sentence

Scoring guide:
- 80–100: Well-written, grammatically correct, appropriate Task 1 language, accurate reference to chart type
- 60–79: Decent but has minor issues in grammar or vocabulary, or slightly informal
- 40–59: Multiple grammar errors OR vocabulary too basic OR inaccurate reference to data
- 0–39: Major grammar issues, completely wrong language, or sentence doesn't describe the chart at all

IMPORTANT:
- All feedback (explanation, reason, structureFeedback) must be in Vietnamese.
- Be encouraging but precise.
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

    const fallbackModels = [
      'gemini-flash-latest',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-pro-latest'
    ];
    let analysis: any;
    const errors: string[] = [];

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        if (result) {
          let text = result.response.text();
          text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const first = text.indexOf('{');
          const last = text.lastIndexOf('}');
          if (first !== -1 && last !== -1 && last > first) {
            text = text.substring(first, last + 1);
          }
          analysis = JSON.parse(text);
          console.log(`[task1-grade] Đã dùng thành công model: ${modelName}`);
          break;
        }
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
        console.warn(`[task1-grade] Model ${modelName} failed: ${e.message}`);
      }
    }

    if (!analysis) {
      throw new Error('All Gemini models failed: ' + errors.join(' | '));
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('[task1-grade] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getSentenceRole(index: number): string {
  const roles: Record<number, string> = {
    0: 'Overview sentence — introduce what the chart shows',
    1: 'General trend / most striking feature',
    2: 'Specific data point 1 (highest/lowest/dominant)',
    3: 'Specific data point 2 or comparison',
    4: 'Another comparison or supporting detail',
    5: 'Trend or change over time',
    6: 'Contrast or exception',
    7: 'Additional notable figure',
    8: 'Summarizing pattern or concluding observation',
    9: 'Final overall comment or clincher',
  };
  return roles[index] ?? `Supporting detail (sentence ${index + 1})`;
}

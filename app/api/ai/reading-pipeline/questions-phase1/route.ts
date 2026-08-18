import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { paragraphs } = await req.json();

    const prompt = `Based on the following highly academic reading passage:

Passage:
${paragraphs.join('\n\n')}

IMPORTANT RULES:
- Create EXACTLY 10 questions based on the passage provided above.
- The questions MUST be divided into 2 types (5 MC, 5 Matching Heading).
- ALL 10 questions MUST strictly follow a generic multiple-choice JSON format.

CRITICAL JSON RULE: 
- DO NOT output literal newline characters inside any string value! 
- Every string (especially explanations) MUST be a single continuous line. 

Question Types & Format Instructions:
1. 5 Multiple Choice (MC) Questions: Standard 4 options (A, B, C, D) testing deep inference.
2. 5 Matching Heading Questions:
   - "question": "Which heading best fits Paragraph [X]?"
   - "options": Provide 4 different tricky academic headings.

- The "correctAnswer" is the 0-indexed integer of the correct option in the "options" array.
- Each question MUST include an "explanation" field. IMPORTANT: Keep the explanation EXTREMELY short and concise (max 1 sentence) to save tokens.
- The output MUST be a valid JSON object.

Format:
{
  "questions": [
    {
      "question": "What is the main idea of paragraph 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}`;

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
          max_tokens: 1500
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

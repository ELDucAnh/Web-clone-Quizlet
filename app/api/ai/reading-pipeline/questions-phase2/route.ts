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
- The questions MUST be divided into 2 types (5 TFNG, 5 Matching Information).
- ALL 10 questions MUST strictly follow a generic multiple-choice JSON format.

CRITICAL JSON RULE: 
- DO NOT output literal newline characters inside any string value! 
- Every string (especially explanations) MUST be a single continuous line. 

Question Types & Format Instructions:
1. 5 True/False/Not Given (TFNG) Questions:
   - "question": "Do the following statement agree with the claims of the writer? Statement: [Insert abstract statement]"
   - "options": EXACTLY 3 options: ["True", "False", "Not Given"]
2. 5 Matching Information Questions:
   - "question": "Which paragraph contains the following information: [Insert specific abstract information]?"
   - "options": Provide 4 different paragraph references, e.g., ["Paragraph 1", "Paragraph 2", "Paragraph 4", "Paragraph 6"].

- The "correctAnswer" is the 0-indexed integer of the correct option in the "options" array.
- Each question MUST include an "explanation" field. IMPORTANT: Keep the explanation EXTREMELY short and concise (max 1 sentence) to save tokens.
- The output MUST be a valid JSON object.

Format:
{
  "questions": [
    {
      "question": "Do the following statement agree with the claims of the writer? Statement: X is Y.",
      "options": ["True", "False", "Not Given"],
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

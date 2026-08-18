import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const maxDuration = 60; // Allows up to 60s for Vercel Hobby

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { words, paragraphs } = await req.json();
    if (!words || !Array.isArray(words) || !paragraphs || !Array.isArray(paragraphs)) {
      return NextResponse.json({ error: 'Missing words or paragraphs' }, { status: 400 });
    }

    const prompt = `Based on the following highly academic reading passage and vocabulary words:
Vocabulary: ${words.join(', ')}

Passage:
${paragraphs.join('\n\n')}

IMPORTANT RULES:
- Create EXACTLY 10 questions based on the passage provided above.
- The questions MUST be divided into 2 types (5 questions each).
- ALL 10 questions MUST strictly follow a generic multiple-choice JSON format.

CRITICAL JSON RULE: 
- DO NOT output literal newline characters inside any string value! 
- Every string (especially explanations) MUST be a single continuous line. 
- Do NOT press Enter/Return inside any string.

Question Types & Format Instructions:
1. 5 True/False/Not Given (TFNG) Questions:
   - "question": "Do the following statement agree with the claims of the writer? Statement: [Insert abstract statement]"
   - "options": EXACTLY 3 options: ["True", "False", "Not Given"]
2. 5 Matching Information Questions:
   - "question": "Which paragraph contains the following information: [Insert specific abstract information]?"
   - "options": Provide 4 different paragraph references, e.g., ["Paragraph 1", "Paragraph 2", "Paragraph 4", "Paragraph 6"].

- Each question must have EXACTLY the options specified above.
- The "correctAnswer" is the 0-indexed integer of the correct option in the "options" array.
- Each question MUST include an "explanation" field. IMPORTANT: Keep the explanation EXTREMELY short and concise (max 1 sentence) to save tokens.
- The output MUST be a valid JSON object.

Format:
{
  "questions": [
    {
      "question": "Do the following statement agree with the claims of the writer? Statement: The evolution of X is fast.",
      "options": ["True", "False", "Not Given"],
      "correctAnswer": 0,
      "explanation": "..."
    }
    // EXACTLY 10 QUESTIONS TOTAL
  ]
}`;

    const fallbackModels = ['groq/compound', 'groq/compound-mini'];
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
    let phase2Data;
    
    try {
      phase2Data = JSON.parse(responseText);
    } catch (parseError: any) {
      if (completion.choices[0]?.finish_reason === 'length') {
        throw new Error("AI đang viết thì bị ngắt ngang do vượt quá giới hạn Token/Phút (TPM). Vui lòng nghỉ tay chờ 1 phút rồi tạo lại nhé!");
      }
      throw new Error("Lỗi rách file JSON (do AI bị ngắt kết nối hoặc hết hạn ngạch Token): " + parseError.message);
    }

    return NextResponse.json(phase2Data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

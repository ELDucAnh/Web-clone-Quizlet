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

    const prompt = `Create an EXTREMELY complex, high-difficulty IELTS Reading Passage 3 practice exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- The reading passage MUST be at a C2 proficiency level, highly academic, abstract, and extremely complex.
- The passage MUST be around 600-800 words and contain exactly 6 long paragraphs.
- The passage MUST naturally incorporate as many of the provided vocabulary words as possible.
- Create EXACTLY 20 questions, divided into 4 types (5 questions each).
- ALL 20 questions MUST strictly follow a generic multiple-choice JSON format.

CRITICAL JSON RULE: 
- DO NOT output literal newline characters inside any string value! 
- Every string (especially paragraph text and explanations) MUST be a single continuous line. 
- If a paragraph is long, keep it as ONE unbroken string. Do NOT press Enter/Return inside the string.

Question Types & Format Instructions:
1. 5 Multiple Choice (MC) Questions: Standard 4 options (A, B, C, D) testing deep inference.
2. 5 Matching Heading Questions:
   - "question": "Which heading best fits Paragraph [X]?"
   - "options": Provide 4 different tricky academic headings.
3. 5 True/False/Not Given (TFNG) Questions:
   - "question": "Do the following statement agree with the claims of the writer? Statement: [Insert abstract statement]"
   - "options": EXACTLY 3 options: ["True", "False", "Not Given"]
4. 5 Matching Information Questions:
   - "question": "Which paragraph contains the following information: [Insert specific abstract information]?"
   - "options": Provide 4 different paragraph references, e.g., ["Paragraph 1", "Paragraph 2", "Paragraph 4", "Paragraph 6"].

- Each question must have EXACTLY the options specified above.
- The "correctAnswer" is the 0-indexed integer of the correct option in the "options" array.
- Each question MUST include an "explanation" field. IMPORTANT: Keep the explanation EXTREMELY short and concise (max 1 sentence) to save tokens.
- The output MUST be a valid JSON object.

Format:
{
  "title": "A highly academic title",
  "paragraphs": [
    "Paragraph 1 text...",
    "Paragraph 2 text..."
  ],
  "questions": [
    {
      "question": "Which heading best fits Paragraph 2?",
      "options": ["The evolution of X", "The sudden decline of Y", "A misunderstanding of Z", "The future of W"],
      "correctAnswer": 2,
      "explanation": "..."
    }
    // EXACTLY 20 QUESTIONS TOTAL
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
          max_tokens: 5500,
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
    let readingPractice;
    
    try {
      readingPractice = JSON.parse(responseText);
    } catch (parseError: any) {
      if (completion.choices[0]?.finish_reason === 'length') {
        throw new Error("AI đang viết thì bị ngắt ngang do vượt quá giới hạn Token/Phút (TPM). Vui lòng nghỉ tay chờ 1 phút rồi tạo lại nhé!");
      }
      throw new Error("Lỗi rách file JSON (do AI bị ngắt kết nối hoặc hết hạn ngạch Token): " + parseError.message);
    }

    return NextResponse.json(readingPractice);

  } catch (error: any) {
    console.error('Error generating reading:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

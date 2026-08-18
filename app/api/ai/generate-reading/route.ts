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

    const prompt = `Create a highly complex IELTS Reading Passage 3 practice exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Create exactly ONE reading passage and EXACTLY 10 multiple-choice questions.
- The reading passage MUST be academic, highly complex, and contain exactly 6 paragraphs (mimicking IELTS Reading Passage 3).
- The passage MUST naturally incorporate as many of the provided vocabulary words as possible.
- The 10 questions MUST test deep comprehension, inference, author's tone/purpose, and detailed synthesis.
- Each question must have exactly 4 options.
- Each question MUST include an "explanation" field that explains WHY the correct answer is right and why others might be wrong.
- The output MUST be a valid JSON object.

Format:
{
  "title": "Title of the passage",
  "paragraphs": [
    "Paragraph 1 text...",
    "Paragraph 2 text...",
    "Paragraph 3 text...",
    "Paragraph 4 text...",
    "Paragraph 5 text...",
    "Paragraph 6 text..."
  ],
  "questions": [
    {
      "question": "What is the author's main argument in the third paragraph?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Option A is correct because... Option B is incorrect because..."
    }
  ]
}`;

    const fallbackModels = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'llama3-70b-8192', 'gemma2-9b-it'];
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
          temperature: 0.7,
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
    const readingPractice = JSON.parse(responseText);

    return NextResponse.json(readingPractice);

  } catch (error: any) {
    console.error('Error generating reading:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

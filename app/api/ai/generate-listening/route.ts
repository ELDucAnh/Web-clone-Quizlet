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

    const prompt = `Create a challenging IELTS Listening Section 4 practice exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Create exactly ONE academic lecture/presentation and EXACTLY 10 multiple-choice questions.
- The lecture MUST be a complex academic monologue given by a SINGLE speaker (e.g., a university professor or expert).
- The lecture MUST be long (around 200-300 words).
- The lecture MUST naturally incorporate as many of the provided vocabulary words as possible.
- The 10 questions MUST test synthesis of information, inference, and identifying main ideas (like IELTS Listening Section 4). They must NOT be simple word-matching questions.
- Each question must have exactly 4 options.
- The output MUST be a valid JSON object.

Format:
{
  "dialogue": [
    { "speaker": "Professor", "text": "The entire academic lecture text here..." }
  ],
  "questions": [
    {
      "question": "What is the speakers' main conclusion about X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}`;

    const fallbackModels = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
    let completion;
    let lastError;

    for (const modelName of fallbackModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are an expert IELTS Listening examiner. Output valid JSON only." },
            { role: "user", content: prompt }
          ],
          model: modelName,
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        if (completion) break;
      } catch (e: any) {
        lastError = e;
        console.warn(`Groq Model ${modelName} failed: ${e.message}`);
      }
    }

    if (!completion) {
      throw lastError || new Error('All Groq models failed');
    }

    const responseText = completion.choices[0]?.message?.content || "";
    const listeningPractice = JSON.parse(responseText);

    return NextResponse.json(listeningPractice);

  } catch (error: any) {
    console.error('Error generating listening:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

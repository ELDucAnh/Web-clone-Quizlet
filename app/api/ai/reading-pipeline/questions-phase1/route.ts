import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { paragraphs } = await req.json();

    const prompt = `Based on the following highly academic reading passage:

Passage:
${paragraphs.join('\n\n')}

IMPORTANT RULES:
- Create EXACTLY 7 questions based on the passage provided above.
- ALL 7 questions MUST be of the type "True / False / Not Given".
- ALL 7 questions MUST strictly follow the JSON format below.

CRITICAL JSON RULE: 
- DO NOT output literal newline characters inside any string value! 
- Every string (especially explanations) MUST be a single continuous line. 

Question Types & Format Instructions:
1. True/False/Not Given (TFNG) Questions:
   - "question": "Do the following statement agree with the claims of the writer? Statement: [Insert abstract statement here]"
   - "options": EXACTLY 3 options: ["True", "False", "Not Given"]

- The "correctAnswer" is the 0-indexed integer of the correct option in the "options" array (0 for True, 1 for False, 2 for Not Given).
- Each question MUST include an "explanation" field. IMPORTANT: Write a short, concise explanation (1-2 sentences) on why it is True, False, or Not Given.
- The output MUST be a valid JSON object.

Format:
{
  "questions": [
    {
      "question": "Do the following statement agree with the claims of the writer? Statement: X is Y.",
      "options": ["True", "False", "Not Given"],
      "correctAnswer": 0,
      "explanation": "[Write a short explanation here]"
    }
  ]
}`;

    const fallbackGemini = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ];
    
    const fallbackGroq = [
      'qwen/qwen3.6-27b', 
      'openai/gpt-oss-20b', 
      'groq/compound-mini', 
      'groq/compound'
    ];

    let data;
    let errors: string[] = [];
    
    // Combine prompt and system instruction
    const fullPrompt = `You are an expert IELTS Reading examiner. Output valid JSON only.\n\n${prompt}`;

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      for (const modelName of fallbackGemini) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
          });
          
          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          let responseText = response.text();
          
          responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          
          const firstCurly = responseText.indexOf('{');
          const firstSquare = responseText.indexOf('[');
          let firstBrace = -1;
          if (firstCurly !== -1 && firstSquare !== -1) firstBrace = Math.min(firstCurly, firstSquare);
          else if (firstCurly !== -1) firstBrace = firstCurly;
          else firstBrace = firstSquare;

          const lastBrace = Math.max(responseText.lastIndexOf('}'), responseText.lastIndexOf(']'));
          
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
            responseText = responseText.substring(firstBrace, lastBrace + 1);
          }

          data = JSON.parse(responseText);
          break; // Successfully parsed JSON
        } catch (e: any) {
          errors.push(`[${modelName}]: ${e.message}`);
        }
      }
    }

    // 2. If Gemini fails (e.g. 429 Quota Exceeded), fallback to Groq
    if (!data && process.env.GROQ_API_KEY) {
      for (const modelName of fallbackGroq) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: "You are an expert IELTS Reading examiner. Output valid JSON only." },
              { role: "user", content: prompt }
            ],
            model: modelName,
            temperature: 0.3,
            max_tokens: 1500
          });
          
          if (completion) {
            let responseText = completion.choices[0]?.message?.content || "";
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            const firstCurly = responseText.indexOf('{');
            const firstSquare = responseText.indexOf('[');
            let firstBrace = -1;
            if (firstCurly !== -1 && firstSquare !== -1) firstBrace = Math.min(firstCurly, firstSquare);
            else if (firstCurly !== -1) firstBrace = firstCurly;
            else firstBrace = firstSquare;

            const lastBrace = Math.max(responseText.lastIndexOf('}'), responseText.lastIndexOf(']'));
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
              responseText = responseText.substring(firstBrace, lastBrace + 1);
            }

            data = JSON.parse(responseText);
            break; // Successfully parsed JSON
          }
        } catch (e: any) {
          errors.push(`[${modelName}]: ${e.message}`);
        }
      }
    }

    if (!data) {
      throw new Error('All AI models failed (Quota/Rate Limits). Details: ' + errors.join(' | '));
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

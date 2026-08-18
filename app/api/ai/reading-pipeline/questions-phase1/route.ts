import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
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

    const fallbackModels = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ];
    let data;
    let errors: string[] = [];
    
    // Combine prompt and system instruction
    const fullPrompt = `You are an expert IELTS Reading examiner. Output valid JSON only.\n\n${prompt}`;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          }
        });
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        let responseText = response.text();
        
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find the first { or [ and last } or ]
        const firstBrace = responseText.search(/[\{\[]/);
        const lastBrace = responseText.search(/[\}\]][^}\]]*$/);
        if (firstBrace !== -1 && lastBrace !== -1) {
          responseText = responseText.substring(firstBrace, lastBrace + 1);
        }

        data = JSON.parse(responseText);
        break; // Successfully parsed JSON, break the loop
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
      }
    }

    if (!data) {
      throw new Error('All Gemini models failed. Details: ' + errors.join(' | '));
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

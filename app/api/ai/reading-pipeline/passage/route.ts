import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export const maxDuration = 60; // Allow max 60s for Vercel Hobby

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { words } = await req.json();

    const prompt = `Write an engaging, logical, and highly coherent academic IELTS reading passage (C1 Advanced proficiency level, approximately 400 words).
The passage MUST have a clear central theme (e.g., Psychology, Sociology, Biology, Technology, or History) and flow naturally from introduction to conclusion.

Vocabulary words to integrate seamlessly and contextually: ${words.join(', ')}
(IMPORTANT: Do not just randomly insert the vocabulary words. They MUST make perfect sense within the logical context of the sentences).

IMPORTANT RULES:
- Generate a captivating academic title.
- Generate a highly coherent academic passage divided into 3-4 paragraphs.
- Output MUST be a valid JSON object.
CRITICAL JSON RULE: DO NOT use literal newlines inside strings. Keep each paragraph as a single continuous string.

Format:
{
  "title": "[Insert an academic title here]",
  "paragraphs": [
    "[Write the full first paragraph here]",
    "[Write the full second paragraph here]",
    "[Write the full third paragraph here]"
  ]
}`;

    const fallbackGroq = [
      'qwen/qwen3.6-27b', 
      'openai/gpt-oss-20b', 
      'groq/compound-mini', 
      'groq/compound'
    ];
    
    let data: any;
    let errors: string[] = [];
    
    for (const modelName of fallbackGroq) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are an expert IELTS Reading examiner. Output valid JSON only." },
            { role: "user", content: prompt }
          ],
          model: modelName,
          temperature: 0.3,
          max_tokens: 2500
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

          // Normalize data
          if (Array.isArray(data)) {
             throw new Error("Returned array instead of full object with title/paragraphs");
          }

          if (data && data.title && data.paragraphs) {
            break; // Successfully parsed JSON
          } else {
            throw new Error("Missing required fields in JSON.");
          }
        }
      } catch (e: any) {
        errors.push(`[${modelName}]: ${e.message}`);
      }
    }

    if (!data) {
      throw new Error('All Groq models failed. Details: ' + errors.join(' | '));
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

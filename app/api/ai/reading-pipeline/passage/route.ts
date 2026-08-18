import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export const maxDuration = 60; // Allow max 60s for Vercel Hobby

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { words, previousContext, part } = await req.json();

    let prompt = "";
    if (part === 1) {
      prompt = `Write the Title and the FIRST 2 paragraphs of a highly academic, C2 proficiency level reading passage.
Vocabulary words to include: ${words.join(', ')}

IMPORTANT RULES:
- Generate exactly 1 title and exactly 2 long, complex paragraphs.
- Output MUST be a valid JSON object.
CRITICAL JSON RULE: DO NOT use literal newlines inside strings. Keep each paragraph as a single continuous string.

Format:
{
  "title": "[Insert an academic title here]",
  "paragraphs": ["[Write the full, lengthy first paragraph here]", "[Write the full, lengthy second paragraph here]"]
}`;
    } else if (part === 2) {
      prompt = `Continue the following highly academic reading passage. 
Previous context:
${previousContext}

Vocabulary words to include: ${words.join(', ')}

IMPORTANT RULES:
- Generate EXACTLY 2 new paragraphs that logically continue the passage above.
- Do NOT repeat the previous context. Just write the next 2 paragraphs.
- Output MUST be a valid JSON object.
CRITICAL JSON RULE: DO NOT use literal newlines inside strings. Keep each paragraph as a single continuous string.

Format:
{
  "paragraphs": ["[Write the full, lengthy third paragraph here]", "[Write the full, lengthy fourth paragraph here]"]
}`;
    } else {
      prompt = `Conclude the following highly academic reading passage.
Previous context:
${previousContext}

Vocabulary words to include: ${words.join(', ')}

IMPORTANT RULES:
- Generate EXACTLY 2 final paragraphs that conclude the passage above.
- Do NOT repeat the previous context. Just write the next 2 paragraphs.
- Output MUST be a valid JSON object.
CRITICAL JSON RULE: DO NOT use literal newlines inside strings. Keep each paragraph as a single continuous string.

Format:
{
  "paragraphs": ["[Write the full, lengthy fifth paragraph here]", "[Write the full, lengthy sixth paragraph here]"]
}`;
    }

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

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { words } = await req.json();

    if (!words || words.length === 0) {
      return NextResponse.json({ error: 'Missing words' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert English teacher. 
Create a short, natural English conversation between two people (A and B) that includes ALL of the following vocabulary words:
${words.join(', ')}

The conversation should be realistic, engaging, and make contextual sense.
Format the output as a simple array of objects in JSON:
[
  { "speaker": "A", "text": "..." },
  { "speaker": "B", "text": "..." }
]
Only output the JSON array, no markdown or other text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const conversation = JSON.parse(jsonStr);

    return NextResponse.json({ conversation });

  } catch (error: any) {
    console.error('Error generating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

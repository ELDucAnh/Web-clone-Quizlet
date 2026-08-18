import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Failed to fetch models', details: errorText }, { status: response.status });
    }
    
    const data = await response.json();
    const modelIds = data.data.map((m: any) => m.id);
    
    return NextResponse.json({ availableModels: modelIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

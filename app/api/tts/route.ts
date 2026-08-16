import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  
  if (!text) return new NextResponse('Missing text', { status: 400 });

  try {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=gtx`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google TTS failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable' // cache for 1 year
      }
    });
  } catch (error) {
    console.error('[TTS Proxy Error]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

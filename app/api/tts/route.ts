import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  
  if (!text) return new NextResponse('Missing text', { status: 400 });

  try {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=gtx`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    });
    
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

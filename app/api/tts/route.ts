import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  
  if (!text) return new NextResponse('Missing text', { status: 400 });

  try {
    const splitTextIntoChunks = (str: string, maxLen = 200) => {
      const words = str.split(' ');
      const chunks = [];
      let currentChunk = '';
      
      for (const word of words) {
        if ((currentChunk + ' ' + word).length <= maxLen) {
          currentChunk += (currentChunk ? ' ' : '') + word;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = word;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
      return chunks;
    };

    const chunks = splitTextIntoChunks(text);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=en-US&client=gtx`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Google TTS failed: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    const finalBuffer = Buffer.concat(audioBuffers);
    
    return new NextResponse(finalBuffer, {
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

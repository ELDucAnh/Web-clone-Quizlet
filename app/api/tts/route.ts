import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 30;

// Groq Orpheus TTS voices (all free):
// English: leah, jessica, brittney, amy, sarah, emma (female) | dan, derek, david (male)
const TTS_VOICE = 'jessica';
const TTS_MODEL = 'playai-tts'; // Groq's current TTS model (PlayAI-powered)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) return new NextResponse('Missing text', { status: 400 });

  // ── Try Groq AI TTS first (natural, emotional voice) ──────────────────
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.audio.speech.create({
        model: TTS_MODEL,
        voice: TTS_VOICE,
        input: text,
        response_format: 'wav',
      } as any);

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=86400', // cache 1 day
        },
      });
    } catch (groqErr: any) {
      console.warn('[TTS] Groq TTS failed, falling back to Google:', groqErr?.message);
    }
  }

  // ── Fallback: Google Translate TTS (old behavior) ─────────────────────
  try {
    const splitTextIntoChunks = (str: string, maxLen = 200) => {
      const words = str.split(' ');
      const chunks: string[] = [];
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!response.ok) throw new Error(`Google TTS failed: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    const finalBuffer = Buffer.concat(audioBuffers);
    return new NextResponse(finalBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[TTS Proxy Error]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 30;

export async function GET() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'No GROQ_API_KEY' });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const results: any = {};

  // Test 1: Check SDK version / audio support
  results.sdk_has_audio = typeof (groq as any).audio !== 'undefined';
  results.sdk_has_audio_speech = typeof (groq as any).audio?.speech !== 'undefined';

  // Test 2: Try Groq TTS
  try {
    const response = await (groq as any).audio.speech.create({
      model: 'canopylabs/orpheus-v1-english',
      voice: 'hannah',
      input: 'Hello, this is a test.',
      response_format: 'wav',
    });
    const buf = await response.arrayBuffer();
    results.tts_success = true;
    results.tts_bytes = buf.byteLength;
  } catch (e: any) {
    results.tts_success = false;
    results.tts_error = e?.message;
    results.tts_status = e?.status;
    results.tts_error_type = e?.constructor?.name;
  }

  return NextResponse.json(results);
}

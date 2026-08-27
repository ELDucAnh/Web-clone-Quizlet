import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 30;

export async function GET() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'No GROQ_API_KEY configured' });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const results: Record<string, any> = {};

  results.api_key_prefix = process.env.GROQ_API_KEY.substring(0, 8) + '...';
  results.sdk_has_audio = typeof (groq as any).audio !== 'undefined';
  results.sdk_has_audio_speech = typeof (groq as any).audio?.speech !== 'undefined';

  // Test TTS with a very short text
  try {
    const response = await (groq.audio.speech as any).create({
      model: 'canopylabs/orpheus-v1-english',
      voice: 'hannah',
      input: 'Hello.',
      response_format: 'wav',
    });
    const buf = await response.arrayBuffer();
    results.tts_success = true;
    results.tts_bytes = buf.byteLength;
    results.message = 'Groq TTS is working correctly!';
  } catch (e: any) {
    results.tts_success = false;
    results.tts_error_code = e?.error?.code || e?.code || 'unknown';
    results.tts_error_message = e?.error?.message || e?.message || String(e);
    results.tts_status = e?.status;
    
    if (results.tts_error_message?.includes('model_terms_required')) {
      results.fix = 'Go to: https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english and accept terms';
    }
  }

  // Test list available models (to see if orpheus appears)
  try {
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const modelsData = await modelsRes.json();
    const ttsModels = modelsData.data
      ?.filter((m: any) => m.id.includes('orpheus') || m.id.includes('playai'))
      ?.map((m: any) => m.id) || [];
    results.available_tts_models = ttsModels;
  } catch (e: any) {
    results.models_error = e?.message;
  }

  return NextResponse.json(results, { status: 200 });
}

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 60;

const TTS_MODEL = 'canopylabs/orpheus-v1-english';
// Valid Orpheus voices: autumn, diana, hannah (female) | austin, daniel, troy (male)
const TTS_VOICE = 'hannah';
const MAX_CHARS = 190; // Orpheus limit is 200, use 190 for safety

// ── WAV utilities ─────────────────────────────────────────────────────────────

/** Extract raw PCM bytes from a WAV buffer (strips 44-byte header) */
function extractPCMData(wavBuffer: Buffer): Buffer {
  // WAV header is 44 bytes for standard PCM
  // Find "data" chunk to be safe
  const dataMarker = wavBuffer.indexOf(Buffer.from('data'));
  if (dataMarker === -1) return wavBuffer.subarray(44); // fallback
  const dataStart = dataMarker + 8; // "data" (4) + size (4)
  return wavBuffer.subarray(dataStart);
}

/** Parse WAV header to get audio format info */
function parseWAVHeader(wavBuffer: Buffer) {
  return {
    numChannels: wavBuffer.readUInt16LE(22),
    sampleRate: wavBuffer.readUInt32LE(24),
    bitsPerSample: wavBuffer.readUInt16LE(34),
  };
}

/** Build a proper WAV header for concatenated PCM data */
function buildWAVHeader(pcmLength: number, numChannels: number, sampleRate: number, bitsPerSample: number): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmLength, 4);       // file size - 8
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);                  // PCM chunk size
  header.writeUInt16LE(1, 20);                   // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmLength, 40);           // PCM data size

  return header;
}

// ── Text splitting ────────────────────────────────────────────────────────────

/**
 * Split text into chunks ≤ MAX_CHARS, breaking at sentence/clause boundaries.
 */
function splitIntoChunks(text: string, maxLen = MAX_CHARS): string[] {
  // Normalize whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();
  
  if (normalized.length <= maxLen) return [normalized];

  const chunks: string[] = [];
  // Try to break at sentence boundaries first
  const sentences = normalized.split(/(?<=[.!?])\s+/);
  
  let current = '';
  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      // Long sentence: break at clause boundaries (comma, semicolon)
      if (current) { chunks.push(current.trim()); current = ''; }
      const clauses = sentence.split(/(?<=[,;])\s+/);
      for (const clause of clauses) {
        if (clause.length > maxLen) {
          // Still too long: break by words
          if (current) { chunks.push(current.trim()); current = ''; }
          const words = clause.split(' ');
          for (const word of words) {
            if ((current + ' ' + word).trim().length <= maxLen) {
              current = (current + ' ' + word).trim();
            } else {
              if (current) chunks.push(current.trim());
              current = word;
            }
          }
        } else if ((current + ' ' + clause).trim().length <= maxLen) {
          current = (current + ' ' + clause).trim();
        } else {
          if (current) chunks.push(current.trim());
          current = clause;
        }
      }
    } else if ((current + ' ' + sentence).trim().length <= maxLen) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current.trim());
      current = sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.filter(c => c.length > 0);
}

// ── Main audio generator ──────────────────────────────────────────────────────

async function generateAudio(text: string): Promise<NextResponse> {
  // ── 1. Try Groq Orpheus TTS ─────────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const chunks = splitIntoChunks(text);
      
      console.log(`[TTS] Generating ${chunks.length} chunk(s) via Groq Orpheus`);
      
      const wavBuffers: Buffer[] = [];
      
      for (const chunk of chunks) {
        const response = await (groq.audio.speech as any).create({
          model: TTS_MODEL,
          voice: TTS_VOICE,
          input: chunk,
          response_format: 'wav',
        });

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 0) {
          wavBuffers.push(Buffer.from(arrayBuffer));
        }
      }

      if (wavBuffers.length > 0) {
        let finalBuffer: Buffer;

        if (wavBuffers.length === 1) {
          // Single chunk — return as-is
          finalBuffer = wavBuffers[0];
        } else {
          // Multiple chunks — concatenate WAV PCM data properly
          const header = parseWAVHeader(wavBuffers[0]);
          const pcmChunks = wavBuffers.map(buf => extractPCMData(buf));
          const totalPCM = Buffer.concat(pcmChunks);
          const wavHeader = buildWAVHeader(totalPCM.length, header.numChannels, header.sampleRate, header.bitsPerSample);
          finalBuffer = Buffer.concat([wavHeader, totalPCM]);
        }

        return new NextResponse(finalBuffer, {
          headers: {
            'Content-Type': 'audio/wav',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    } catch (e: any) {
      console.warn('[TTS] Groq Orpheus failed, falling back to Google TTS:', e?.message);
    }
  }

  // ── 2. Fallback: Google Translate TTS ───────────────────────────────────
  console.log('[TTS] Using Google Translate TTS fallback');
  const googleChunks = splitIntoChunks(text, 180);
  const audioBuffers: Buffer[] = [];

  for (const chunk of googleChunks) {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=en-US&client=gtx`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!res.ok) throw new Error(`Google TTS failed: ${res.status}`);
    audioBuffers.push(Buffer.from(await res.arrayBuffer()));
  }

  return new NextResponse(Buffer.concat(audioBuffers), {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=604800',
    },
  });
}

// ── Route handlers ────────────────────────────────────────────────────────────

/** GET — short texts via query param (flashcard words, sentences) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  if (!text) return new NextResponse('Missing text', { status: 400 });

  try {
    return await generateAudio(text);
  } catch (err: any) {
    console.error('[TTS GET Error]', err);
    return new NextResponse('TTS failed', { status: 500 });
  }
}

/** POST — long texts via request body (dialogues, passages — no URL length limit) */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) return new NextResponse('Missing text', { status: 400 });
    return await generateAudio(text);
  } catch (err: any) {
    console.error('[TTS POST Error]', err);
    return new NextResponse('TTS failed', { status: 500 });
  }
}

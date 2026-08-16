import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sample = await request.json();

    // Auto-fix schema issues just in case they are missing
    try {
      await db.query(`ALTER TABLE speaking_submissions ADD COLUMN IF NOT EXISTS ai_feedback jsonb`);
      await db.query(`ALTER TABLE speaking_submissions ALTER COLUMN band TYPE numeric USING band::numeric`);
    } catch (e) {
      console.warn('[Speaking API] Schema auto-fix warning:', e);
    }

    await db.query(
      `INSERT INTO speaking_submissions (id, user_id, part, topic, transcript, band, ai_feedback) 
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb) 
       ON CONFLICT (id) DO UPDATE SET part=$3, topic=$4, transcript=$5, band=$6, ai_feedback=$7::jsonb, updated_at=NOW()`,
      [sample.id, userId, sample.part, sample.topic, sample.transcript, sample.band || null, sample.aiFeedback ? JSON.stringify(sample.aiFeedback) : null]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    console.error('[Speaking Submissions API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

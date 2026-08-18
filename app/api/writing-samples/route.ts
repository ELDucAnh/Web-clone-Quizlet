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
      await db.query(`ALTER TABLE writing_samples ADD COLUMN IF NOT EXISTS tags text[]`);
      await db.query(`ALTER TABLE writing_samples ADD COLUMN IF NOT EXISTS ai_feedback jsonb`);
      await db.query(`ALTER TABLE writing_samples ADD COLUMN IF NOT EXISTS folder_id uuid`);
      await db.query(`ALTER TABLE writing_samples ALTER COLUMN band TYPE numeric USING band::numeric`);
    } catch (e) {
      console.warn('[Writing API] Schema auto-fix warning:', e);
    }

    await db.query(
      `INSERT INTO writing_samples (id, user_id, task, title, topic, content, band, tags, ai_feedback, folder_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::jsonb, $10) 
       ON CONFLICT (id) DO UPDATE SET task=$3, title=$4, topic=$5, content=$6, band=$7, tags=$8::text[], ai_feedback=$9::jsonb, folder_id=$10, updated_at=NOW()`,
      [sample.id, userId, sample.task, sample.title, sample.topic, sample.content, sample.band || null, sample.tags || [], sample.aiFeedback ? JSON.stringify(sample.aiFeedback) : null, sample.folderId || null]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    console.error('[Writing Samples API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

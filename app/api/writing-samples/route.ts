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
    await db.query(
      `INSERT INTO writing_samples (id, user_id, task, title, topic, content, band, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[]) 
       ON CONFLICT (id) DO UPDATE SET task=$3, title=$4, topic=$5, content=$6, band=$7, tags=$8::text[], updated_at=NOW()`,
      [sample.id, userId, sample.task, sample.title, sample.topic, sample.content, sample.band || null, sample.tags || []]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    console.error('[Writing Samples API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

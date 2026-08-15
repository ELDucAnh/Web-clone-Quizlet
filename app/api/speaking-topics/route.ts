import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const topic = await request.json();
    await db.query(
      `INSERT INTO speaking_topics (id, user_id, part, topic, questions, sample_answer, keywords) 
       VALUES ($1, $2, $3, $4, $5::text[], $6, $7::text[]) 
       ON CONFLICT (id) DO UPDATE SET part=$3, topic=$4, questions=$5::text[], sample_answer=$6, keywords=$7::text[], updated_at=NOW()`,
      [topic.id, userId, topic.part, topic.topic, topic.questions || [], topic.sampleAnswer || null, topic.keywords || []]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    console.error('[Speaking Topics API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

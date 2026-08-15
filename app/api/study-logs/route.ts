import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const log = await request.json();
    await db.query(
      'INSERT INTO study_hours_logs (id, goal_id, user_id, skill, minutes, content, study_date) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET minutes=$5, content=$6',
      [log.id, log.goalId, userId, log.skill, log.minutes, log.content, new Date(log.date)]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    console.error('[Study Logs API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

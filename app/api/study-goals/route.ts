import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const goal = await request.json();
    await db.query(
      'INSERT INTO study_hours_goals (id, user_id, skill, target_hours, deadline) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET target_hours=$4, deadline=$5',
      [goal.id, userId, goal.skill, goal.targetHours, goal.deadline ? new Date(goal.deadline) : null]
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    console.error('[Study Goals API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

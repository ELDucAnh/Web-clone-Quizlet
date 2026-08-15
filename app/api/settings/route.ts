import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { settings } = await request.json();
    if (!settings) return NextResponse.json({ error: 'Missing settings payload' }, { status: 400 });

    const dailyGoal = settings.dailyGoal ?? 20;

    const { rows } = await db.query(
      `UPDATE users SET daily_goal = $1, settings = $2, updated_at = NOW() WHERE id = $3 RETURNING daily_goal, settings`,
      [dailyGoal, JSON.stringify(settings), userId]
    );

    if (rows.length === 0) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('[Settings PUT API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

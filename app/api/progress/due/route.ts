import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { rows } = await db.query(
      `SELECT cp.*, c.term, c.definition, c.deck_id, c.starred
       FROM card_progress cp
       JOIN cards c ON c.id = cp.card_id
       WHERE cp.user_id = $1 AND cp.next_review <= NOW()
       ORDER BY cp.next_review ASC
       LIMIT 100`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

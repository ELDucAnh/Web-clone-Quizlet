import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { deckId, mode, totalCards, correctCount, score, startedAt, completedAt } = await request.json();
    const { rows } = await db.query(
      `INSERT INTO study_sessions (user_id, deck_id, mode, total_cards, correct_count, score, started_at, completed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, deckId, mode, totalCards, correctCount, score, 
       startedAt ? new Date(startedAt) : null, 
       completedAt ? new Date(completedAt) : null]
    );
    
    // Update deck.last_studied
    await db.query(
      `UPDATE decks SET last_studied=NOW() WHERE id=$1 AND user_id=$2`,
      [deckId, userId]
    );
    
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

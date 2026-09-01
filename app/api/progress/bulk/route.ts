import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { updates } = await request.json();
    if (!Array.isArray(updates) || updates.length === 0) return NextResponse.json({ ok: true });

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const update of updates) {
        let { rowCount } = await client.query(
          `UPDATE card_progress SET
             learn_stage = $3, ease_factor = $4, interval_days = $5, repetitions = $6,
             correct_streak = $7, total_answers = $8, correct_answers = $9, next_review = $10, last_answered = $11
           WHERE user_id = $1 AND card_id = $2`,
          [userId, update.cardId, update.learnStage, update.easeFactor, update.interval,
           update.repetitions, update.correctStreak, update.totalAnswers, update.correctAnswers,
           update.nextReview ? new Date(update.nextReview) : new Date(0), 
           update.lastAnswered ? new Date(update.lastAnswered) : new Date(0)]
        );

        if (rowCount === 0) {
          // Note: we need deck_id which should be present in the update object
          await client.query(
            `INSERT INTO card_progress
               (user_id, card_id, deck_id, learn_stage, ease_factor, interval_days,
                repetitions, correct_streak, total_answers, correct_answers, next_review, last_answered)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [userId, update.cardId, update.deckId, update.learnStage, update.easeFactor, update.interval,
             update.repetitions, update.correctStreak, update.totalAnswers, update.correctAnswers,
             update.nextReview ? new Date(update.nextReview) : new Date(0), 
             update.lastAnswered ? new Date(update.lastAnswered) : new Date(0)]
          );
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}

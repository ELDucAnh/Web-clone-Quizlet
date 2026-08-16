import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { cardId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      learnStage, easeFactor, interval, repetitions,
      correctStreak, totalAnswers, correctAnswers, nextReview, lastAnswered,
    } = await request.json();

    // Auto-fix schema issues just in case they are missing
    try {
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS learn_stage text`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS ease_factor numeric`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS interval_days integer`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS repetitions integer`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS correct_streak integer`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS total_answers integer`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS correct_answers integer`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS next_review timestamp`);
      await db.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS last_answered timestamp`);
    } catch (e) {
      console.warn('[Progress API] Schema auto-fix warning:', e);
    }

    let { rowCount } = await db.query(
      `UPDATE card_progress SET
         learn_stage = $3, ease_factor = $4, interval_days = $5, repetitions = $6,
         correct_streak = $7, total_answers = $8, correct_answers = $9, next_review = $10, last_answered = $11
       WHERE user_id = $1 AND card_id = $2`,
      [userId, params.cardId, learnStage, easeFactor, interval,
       repetitions, correctStreak, totalAnswers, correctAnswers,
       nextReview ? new Date(nextReview) : null, 
       lastAnswered ? new Date(lastAnswered) : null]
    );

    if (rowCount === 0) {
      await db.query(
        `INSERT INTO card_progress
           (user_id, card_id, deck_id, learn_stage, ease_factor, interval_days,
            repetitions, correct_streak, total_answers, correct_answers, next_review, last_answered)
         SELECT $1, c.id, c.deck_id, $3, $4, $5, $6, $7, $8, $9, $10, $11
         FROM cards c WHERE c.id = $2`,
        [userId, params.cardId, learnStage, easeFactor, interval,
         repetitions, correctStreak, totalAnswers, correctAnswers,
         nextReview ? new Date(nextReview) : null, 
         lastAnswered ? new Date(lastAnswered) : null]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // We can use a query param `due=true` if we want, but since this route is [cardId],
  // a general GET /api/progress/due should be in `app/api/progress/due/route.ts`.
  return NextResponse.json({ error: 'Not implemented here' }, { status: 404 });
}

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

    const { rows } = await db.query(
      `INSERT INTO card_progress
         (user_id, card_id, deck_id, learn_stage, ease_factor, interval_days,
          repetitions, correct_streak, total_answers, correct_answers, next_review, last_answered)
       SELECT $1, c.id, c.deck_id, $3, $4, $5, $6, $7, $8, $9, $10, $11
       FROM cards c WHERE c.id = $2
       ON CONFLICT (user_id, card_id) DO UPDATE SET
         learn_stage    = EXCLUDED.learn_stage,
         ease_factor    = EXCLUDED.ease_factor,
         interval_days  = EXCLUDED.interval_days,
         repetitions    = EXCLUDED.repetitions,
         correct_streak = EXCLUDED.correct_streak,
         total_answers  = EXCLUDED.total_answers,
         correct_answers = EXCLUDED.correct_answers,
         next_review    = EXCLUDED.next_review,
         last_answered  = EXCLUDED.last_answered
       RETURNING *`,
      [userId, params.cardId, learnStage, easeFactor, interval,
       repetitions, correctStreak, totalAnswers, correctAnswers,
       nextReview ? new Date(nextReview) : null, 
       lastAnswered ? new Date(lastAnswered) : null]
    );
    return NextResponse.json(rows[0]);
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

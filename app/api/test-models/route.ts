import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 1. Get Schema of card_progress table
    const { rows: schemaRows } = await db.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'card_progress'
    `);

    // 2. Count rows in card_progress
    const { rows: countRows } = await db.query('SELECT COUNT(*) FROM card_progress');

    // 3. Get first 5 rows
    const { rows: dataRows } = await db.query('SELECT * FROM card_progress LIMIT 5');

    // 4. Try updating a fake row to see if it throws an error
    let testError = null;
    try {
      await db.query(
        `UPDATE card_progress SET
           learn_stage = 'mastered', ease_factor = 2.5, interval_days = 0, repetitions = 1,
           correct_streak = 1, total_answers = 1, correct_answers = 1, next_review = NOW(), last_answered = NOW()
         WHERE user_id = $1 AND card_id = $2`,
        ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000']
      );
    } catch (e: any) {
      testError = e.message;
    }

    return NextResponse.json({
      schema: schemaRows,
      count: countRows[0].count,
      data: dataRows,
      testError,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

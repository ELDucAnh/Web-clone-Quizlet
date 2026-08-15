import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const progressRouter = Router();

// PUT /api/progress/:cardId — update SM-2 progress for a card
progressRouter.put('/:cardId', requireAuth, async (req: AuthRequest, res) => {
  const { cardId } = req.params;
  const {
    learnStage, easeFactor, intervalDays, repetitions,
    correctStreak, totalAnswers, correctAnswers, nextReview, lastAnswered,
  } = req.body;

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
    [req.userId, cardId, learnStage, easeFactor, intervalDays,
     repetitions, correctStreak, totalAnswers, correctAnswers,
     nextReview, lastAnswered]
  );
  res.json(rows[0]);
});

// GET /api/progress/due — cards due for review today
progressRouter.get('/due', requireAuth, async (req: AuthRequest, res) => {
  const { rows } = await db.query(
    `SELECT cp.*, c.term, c.definition, c.deck_id, c.starred
     FROM card_progress cp
     JOIN cards c ON c.id = cp.card_id
     WHERE cp.user_id = $1 AND cp.next_review <= NOW()
     ORDER BY cp.next_review ASC
     LIMIT 100`,
    [req.userId]
  );
  res.json(rows);
});

export const sessionsRouter = Router();

// POST /api/sessions — record a study session
sessionsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { deckId, mode, totalCards, correctCount, score, startedAt, completedAt } = req.body;
  const { rows } = await db.query(
    `INSERT INTO study_sessions (user_id, deck_id, mode, total_cards, correct_count, score, started_at, completed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.userId, deckId, mode, totalCards, correctCount, score, startedAt, completedAt]
  );
  // Also update deck.last_studied
  await db.query(
    `UPDATE decks SET last_studied=NOW() WHERE id=$1 AND user_id=$2`,
    [deckId, req.userId]
  );
  res.status(201).json(rows[0]);
});

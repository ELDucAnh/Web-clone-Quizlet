import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

// Re-export sessions from this file (imported by index.ts as sessionsRouter)
export const sessionsRouter = Router();

sessionsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { deckId, mode, totalCards, correctCount, score, startedAt, completedAt } = req.body;
  const { rows } = await db.query(
    `INSERT INTO study_sessions (user_id, deck_id, mode, total_cards, correct_count, score, started_at, completed_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [req.userId, deckId, mode, totalCards, correctCount, score, startedAt, completedAt]
  );
  await db.query(
    `UPDATE decks SET last_studied=NOW(), updated_at=NOW() WHERE id=$1 AND user_id=$2`,
    [deckId, req.userId]
  );
  res.status(201).json(rows[0]);
});

export const ieltsRouter = Router();

// ── Study Hours ─────────────────────────────────────────────────────────────

ieltsRouter.get('/goals', requireAuth, async (req: AuthRequest, res) => {
  const { rows } = await db.query(`SELECT * FROM study_hours_goals WHERE user_id=$1 ORDER BY created_at DESC`, [req.userId]);
  res.json(rows);
});

ieltsRouter.post('/goals', requireAuth, async (req: AuthRequest, res) => {
  const { skill, targetHours, deadline } = req.body;
  const { rows } = await db.query(
    `INSERT INTO study_hours_goals (user_id, skill, target_hours, deadline) VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.userId, skill, Math.min(1000, targetHours), deadline || null]
  );
  res.status(201).json(rows[0]);
});

ieltsRouter.delete('/goals/:id', requireAuth, async (req: AuthRequest, res) => {
  await db.query(`DELETE FROM study_hours_goals WHERE id=$1 AND user_id=$2`, [req.params.id, req.userId]);
  res.status(204).end();
});

ieltsRouter.post('/logs', requireAuth, async (req: AuthRequest, res) => {
  const { goalId, skill, minutes, content, studyDate } = req.body;
  const { rows } = await db.query(
    `INSERT INTO study_hours_logs (goal_id, user_id, skill, minutes, content, study_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [goalId, req.userId, skill, minutes, content, studyDate]
  );
  res.status(201).json(rows[0]);
});

ieltsRouter.delete('/logs/:id', requireAuth, async (req: AuthRequest, res) => {
  await db.query(`DELETE FROM study_hours_logs WHERE id=$1 AND user_id=$2`, [req.params.id, req.userId]);
  res.status(204).end();
});

// ── Writing Samples ─────────────────────────────────────────────────────────

ieltsRouter.get('/writing', requireAuth, async (req: AuthRequest, res) => {
  const { rows } = await db.query(`SELECT * FROM writing_samples WHERE user_id=$1 ORDER BY updated_at DESC`, [req.userId]);
  res.json(rows);
});

ieltsRouter.post('/writing', requireAuth, async (req: AuthRequest, res) => {
  const { task, title, topic, content, band, tags } = req.body;
  const { rows } = await db.query(
    `INSERT INTO writing_samples (user_id,task,title,topic,content,band,tags) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.userId, task, title, topic, content, band, tags || []]
  );
  res.status(201).json(rows[0]);
});

ieltsRouter.put('/writing/:id', requireAuth, async (req: AuthRequest, res) => {
  const { title, topic, content, band, tags } = req.body;
  const { rows } = await db.query(
    `UPDATE writing_samples SET title=$1,topic=$2,content=$3,band=$4,tags=$5,updated_at=NOW()
     WHERE id=$6 AND user_id=$7 RETURNING *`,
    [title, topic, content, band, tags, req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

ieltsRouter.delete('/writing/:id', requireAuth, async (req: AuthRequest, res) => {
  await db.query(`DELETE FROM writing_samples WHERE id=$1 AND user_id=$2`, [req.params.id, req.userId]);
  res.status(204).end();
});

// ── Speaking Topics ─────────────────────────────────────────────────────────

ieltsRouter.get('/speaking', requireAuth, async (req: AuthRequest, res) => {
  const { rows } = await db.query(`SELECT * FROM speaking_topics WHERE user_id=$1 ORDER BY updated_at DESC`, [req.userId]);
  res.json(rows);
});

ieltsRouter.post('/speaking', requireAuth, async (req: AuthRequest, res) => {
  const { part, topic, questions, sampleAnswer, keywords } = req.body;
  const { rows } = await db.query(
    `INSERT INTO speaking_topics (user_id,part,topic,questions,sample_answer,keywords) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.userId, part, topic, questions || [], sampleAnswer, keywords || []]
  );
  res.status(201).json(rows[0]);
});

ieltsRouter.put('/speaking/:id', requireAuth, async (req: AuthRequest, res) => {
  const { part, topic, questions, sampleAnswer, keywords } = req.body;
  const { rows } = await db.query(
    `UPDATE speaking_topics SET part=$1,topic=$2,questions=$3,sample_answer=$4,keywords=$5,updated_at=NOW()
     WHERE id=$6 AND user_id=$7 RETURNING *`,
    [part, topic, questions, sampleAnswer, keywords, req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

ieltsRouter.delete('/speaking/:id', requireAuth, async (req: AuthRequest, res) => {
  await db.query(`DELETE FROM speaking_topics WHERE id=$1 AND user_id=$2`, [req.params.id, req.userId]);
  res.status(204).end();
});

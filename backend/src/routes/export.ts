import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const exportRouter = Router();


/**
 * GET /api/export
 * Returns a full JSON dump of all user data — mirrors the localStorage backup format.
 * Frontend can use this to download a backup file.
 */
exportRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const uid = req.userId;

  const [
    { rows: decks },
    { rows: cards },
    { rows: progress },
    { rows: sessions },
    { rows: folders },
    { rows: goals },
    { rows: logs },
    { rows: writing },
    { rows: speaking },
  ] = await Promise.all([
    db.query(`SELECT * FROM decks WHERE user_id=$1`, [uid]),
    db.query(`SELECT * FROM cards WHERE user_id=$1`, [uid]),
    db.query(`SELECT * FROM card_progress WHERE user_id=$1`, [uid]),
    db.query(`SELECT * FROM study_sessions WHERE user_id=$1 ORDER BY started_at DESC LIMIT 200`, [uid]),
    db.query(`SELECT * FROM folders WHERE user_id=$1`, [uid]),
    db.query(`SELECT * FROM study_hours_goals WHERE user_id=$1`, [uid]),
    db.query(`SELECT * FROM study_hours_logs WHERE user_id=$1`, [uid]),
    db.query(`SELECT * FROM writing_samples WHERE user_id=$1`, [uid]),
    db.query(`SELECT * FROM speaking_topics WHERE user_id=$1`, [uid]),
  ]);

  res.json({
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      decks: Object.fromEntries(decks.map((d) => [d.id, d])),
      cards: Object.fromEntries(cards.map((c) => [c.id, c])),
      cardsByDeck: decks.reduce((acc, d) => {
        acc[d.id] = cards.filter((c) => c.deck_id === d.id).map((c) => c.id);
        return acc;
      }, {} as Record<string, string[]>),
      progress: Object.fromEntries(progress.map((p) => [p.card_id, p])),
      sessions,
      folders: Object.fromEntries(folders.map((f) => [f.id, f])),
      studyHoursGoals: Object.fromEntries(goals.map((g) => [g.id, g])),
      studyHoursLogs: logs,
      writingSamples: Object.fromEntries(writing.map((w) => [w.id, w])),
      speakingTopics: Object.fromEntries(speaking.map((s) => [s.id, s])),
    },
  });
});

import { Router } from 'express';
import { db } from '../db';
import { requireAuth, signToken, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

export const decksRouter = Router();

const createDeckSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  folderId: z.string().uuid().optional(),
  color: z.string().default('#4255FF'),
  tags: z.array(z.string()).optional(),
  cards: z.array(z.object({
    term: z.string().min(1),
    definition: z.string().min(1),
  })).min(1),
});

// GET /api/decks — list all decks for current user
decksRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { rows } = await db.query(
    `SELECT d.*, COALESCE(
       json_agg(json_build_object('id', c.id, 'term', c.term, 'definition', c.definition, 'starred', c.starred, 'sort_order', c.sort_order)
       ORDER BY c.sort_order) FILTER (WHERE c.id IS NOT NULL), '[]'
     ) as cards
     FROM decks d
     LEFT JOIN cards c ON c.deck_id = d.id
     WHERE d.user_id = $1
     GROUP BY d.id
     ORDER BY d.updated_at DESC`,
    [req.userId]
  );
  res.json(rows);
});

// POST /api/decks — create deck with cards
decksRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createDeckSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, description, folderId, color, tags, cards } = parsed.data;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows: [deck] } = await client.query(
      `INSERT INTO decks (user_id, folder_id, name, description, color, tags)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, folderId || null, name, description || null, color, tags || []]
    );
    for (let i = 0; i < cards.length; i++) {
      await client.query(
        `INSERT INTO cards (deck_id, user_id, term, definition, sort_order) VALUES ($1,$2,$3,$4,$5)`,
        [deck.id, req.userId, cards[i].term, cards[i].definition, i]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(deck);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PUT /api/decks/:id — update deck metadata
decksRouter.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  const { rows } = await db.query(
    `UPDATE decks SET name=$1, description=$2, updated_at=NOW()
     WHERE id=$3 AND user_id=$4 RETURNING *`,
    [name, description || null, req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Deck not found' });
  res.json(rows[0]);
});

// DELETE /api/decks/:id
decksRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { rowCount } = await db.query(
    `DELETE FROM decks WHERE id=$1 AND user_id=$2`,
    [req.params.id, req.userId]
  );
  if (!rowCount) return res.status(404).json({ error: 'Deck not found' });
  res.status(204).end();
});

// POST /api/decks/:id/reset — reset all card progress for a deck
decksRouter.post('/:id/reset', requireAuth, async (req: AuthRequest, res) => {
  await db.query(
    `UPDATE card_progress SET learn_stage='unseen', repetitions=0, correct_streak=0,
     interval_days=0, ease_factor=2.50, next_review=NOW()
     WHERE deck_id=$1 AND user_id=$2`,
    [req.params.id, req.userId]
  );
  res.json({ ok: true });
});

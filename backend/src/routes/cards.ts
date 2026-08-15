import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const cardsRouter = Router();

// POST /api/cards — add a card to a deck
cardsRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { deckId, term, definition } = req.body;
  const { rows } = await db.query(
    `INSERT INTO cards (deck_id, user_id, term, definition)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [deckId, req.userId, term, definition]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/cards/:id — update a card
cardsRouter.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { term, definition, starred } = req.body;
  const { rows } = await db.query(
    `UPDATE cards SET term=$1, definition=$2, starred=COALESCE($3,starred)
     WHERE id=$4 AND user_id=$5 RETURNING *`,
    [term, definition, starred, req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Card not found' });
  res.json(rows[0]);
});

// DELETE /api/cards/:id
cardsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  await db.query(`DELETE FROM cards WHERE id=$1 AND user_id=$2`, [req.params.id, req.userId]);
  res.status(204).end();
});

// PATCH /api/cards/:id/star — toggle star
cardsRouter.patch('/:id/star', requireAuth, async (req: AuthRequest, res) => {
  const { rows } = await db.query(
    `UPDATE cards SET starred = NOT starred WHERE id=$1 AND user_id=$2 RETURNING *`,
    [req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Card not found' });
  res.json(rows[0]);
});

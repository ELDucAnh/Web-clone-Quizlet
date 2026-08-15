import { Router } from 'express';
import { db } from '../db';
import { signToken } from '../middleware/auth';

export const authRouter = Router();

/**
 * POST /api/auth/google
 * Body: { googleToken: string }
 *
 * Verifies Google ID token, upserts user, returns JWT.
 * TODO: Install google-auth-library and verify the token properly.
 * For now, accepts a decoded payload for development.
 */
authRouter.post('/google', async (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const { rows } = await db.query(
    `INSERT INTO users (email, name, avatar_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, avatar_url=EXCLUDED.avatar_url, updated_at=NOW()
     RETURNING *`,
    [email, name, avatarUrl]
  );
  const user = rows[0];
  const token = signToken(user.id);
  res.json({ token, user });
});

/**
 * POST /api/auth/dev-login — DEV ONLY: login with just an email (no OAuth)
 */
authRouter.post('/dev-login', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Dev only' });
  }
  const email = req.body.email || 'dev@quizlu.local';
  const { rows } = await db.query(
    `INSERT INTO users (email, name) VALUES ($1, 'Dev User')
     ON CONFLICT (email) DO UPDATE SET updated_at=NOW() RETURNING *`,
    [email]
  );
  res.json({ token: signToken(rows[0].id), user: rows[0] });
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { decksRouter } from './routes/decks';
import { cardsRouter } from './routes/cards';
import { progressRouter } from './routes/progress';
import { sessionsRouter, ieltsRouter } from './routes/ielts';
import { exportRouter } from './routes/export';


const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/decks',    decksRouter);
app.use('/api/cards',    cardsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/ielts',    ieltsRouter);
app.use('/api/export',   exportRouter);

// ── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ───────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Quizlu API] Running on http://localhost:${PORT}`);
});

export default app;

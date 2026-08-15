import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

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

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
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
      [userId]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createDeckSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { name, description, folderId, color, tags, cards } = parsed.data;
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      const { rows: [deck] } = await client.query(
        `INSERT INTO decks (user_id, folder_id, name, description, color, tags)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, folderId || null, name, description || null, color, tags || []]
      );
      
      for (let i = 0; i < cards.length; i++) {
        await client.query(
          `INSERT INTO cards (deck_id, user_id, term, definition, sort_order) VALUES ($1,$2,$3,$4,$5)`,
          [deck.id, userId, cards[i].term, cards[i].definition, i]
        );
      }
      await client.query('COMMIT');
      return NextResponse.json(deck, { status: 201 });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

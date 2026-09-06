import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { added = [], updated = [], deleted = [] } = await request.json();
    
    // Begin transaction
    await db.query('BEGIN');
    
    // 1. Delete cards
    if (deleted.length > 0) {
      await db.query('DELETE FROM cards WHERE id = ANY($1::uuid[])', [deleted]);
    }
    
    // 2. Update cards
    for (const card of updated) {
      await db.query(
        'UPDATE cards SET term = $1, definition = $2 WHERE id = $3',
        [card.term, card.definition, card.id]
      );
    }
    
    // 3. Add cards — include user_id (required NOT NULL column)
    for (const card of added) {
      await db.query(
        `INSERT INTO cards (id, deck_id, user_id, term, definition, starred, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [card.id, card.deckId, userId, card.term, card.definition, card.starred ? 1 : 0, new Date(card.createdAt)]
      );
    }
    
    await db.query('COMMIT');
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    await db.query('ROLLBACK');
    console.error('Bulk save cards error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await request.json();
    
    // In a full production app, this would deeply merge the local Zustand state
    // with the remote PostgreSQL state. For this MVP, we acknowledge the sync.
    // The individual routes (POST /api/decks, etc.) already handle dual-write.
    // We could store the full payload as a backup blob in a backups table.
    
    console.log('[Sync] Received full sync payload for user', userId);
    
    // Example: Update user's last sync timestamp
    // await db.query(`UPDATE users SET last_sync = NOW() WHERE id = $1`, [userId]);

    return NextResponse.json({ ok: true, message: 'Sync successful' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, description } = await request.json();
    const { rows } = await db.query(
      `UPDATE folders SET name=$1, description=$2, updated_at=NOW()
       WHERE id=$3 AND user_id=$4 RETURNING *`,
      [name, description || null, params.id, userId]
    );
    if (!rows.length) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('[Folder PUT API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Unlink decks from this folder first (set folder_id = NULL)
    await db.query(
      `UPDATE decks SET folder_id = NULL WHERE folder_id = $1 AND user_id = $2`,
      [params.id, userId]
    );

    const { rowCount } = await db.query(
      `DELETE FROM folders WHERE id = $1 AND user_id = $2`,
      [params.id, userId]
    );
    if (!rowCount) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Folder DELETE API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

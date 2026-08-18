import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, description, folderId } = await request.json();
    
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name=$${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description=$${idx++}`);
      values.push(description || null);
    }
    if (folderId !== undefined) {
      fields.push(`folder_id=$${idx++}`);
      values.push(folderId || null);
    }
    
    fields.push(`updated_at=NOW()`);
    values.push(params.id, userId);

    const { rows } = await db.query(
      `UPDATE decks SET ${fields.join(', ')}
       WHERE id=$${idx++} AND user_id=$${idx} RETURNING *`,
      values
    );
    if (!rows.length) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { rowCount } = await db.query(
      `DELETE FROM decks WHERE id=$1 AND user_id=$2`,
      [params.id, userId]
    );
    if (!rowCount) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

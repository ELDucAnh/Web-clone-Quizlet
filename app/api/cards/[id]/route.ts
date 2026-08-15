import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { term, definition, starred } = await request.json();
    const { rows } = await db.query(
      `UPDATE cards SET term=$1, definition=$2, starred=COALESCE($3,starred)
       WHERE id=$4 AND user_id=$5 RETURNING *`,
      [term, definition, starred, params.id, userId]
    );
    if (!rows.length) return NextResponse.json({ error: 'Card not found' }, { status: 404 });
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
      `DELETE FROM cards WHERE id=$1 AND user_id=$2`,
      [params.id, userId]
    );
    if (!rowCount) return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

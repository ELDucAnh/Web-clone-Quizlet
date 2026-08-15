import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.query('DELETE FROM study_hours_goals WHERE id = $1 AND user_id = $2', [params.id, userId]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Study Goals DELETE API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

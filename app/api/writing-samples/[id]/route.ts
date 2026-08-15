import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const keys = Object.keys(data).filter(k => ['task', 'title', 'topic', 'content', 'band', 'tags'].includes(k));
    
    if (keys.length === 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    let query = 'UPDATE writing_samples SET ';
    const values = [];
    let i = 1;
    
    for (const key of keys) {
      query += `${key} = $${i}, `;
      values.push(key === 'tags' ? (data[key] || []) : (data[key] ?? null));
      i++;
    }
    
    query += `updated_at = NOW() WHERE id = $${i} AND user_id = $${i+1}`;
    values.push(params.id, userId);
    
    // cast tags array if it's the only one
    query = query.replace('tags = $', 'tags = $').replace(/tags = \$(\d+)/, 'tags = $$1::text[]');

    await db.query(query, values);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Writing Samples PUT API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.query('DELETE FROM writing_samples WHERE id = $1 AND user_id = $2', [params.id, userId]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Writing Samples DELETE API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

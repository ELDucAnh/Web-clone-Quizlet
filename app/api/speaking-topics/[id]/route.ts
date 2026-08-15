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
    const validKeys = ['part', 'topic', 'questions', 'sampleAnswer', 'keywords'];
    const keys = Object.keys(data).filter(k => validKeys.includes(k));
    
    if (keys.length === 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    let query = 'UPDATE speaking_topics SET ';
    const values = [];
    let i = 1;
    
    for (const key of keys) {
      const dbKey = key === 'sampleAnswer' ? 'sample_answer' : key;
      query += `${dbKey} = $${i}, `;
      values.push(
        (key === 'questions' || key === 'keywords') ? (data[key] || []) : (data[key] ?? null)
      );
      i++;
    }
    
    query += `updated_at = NOW() WHERE id = $${i} AND user_id = $${i+1}`;
    values.push(params.id, userId);
    
    // cast text[] for array columns
    query = query.replace('questions = $', 'questions = $').replace(/questions = \$(\d+)/, 'questions = $$1::text[]');
    query = query.replace('keywords = $', 'keywords = $').replace(/keywords = \$(\d+)/, 'keywords = $$1::text[]');

    await db.query(query, values);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Speaking Topics PUT API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.query('DELETE FROM speaking_topics WHERE id = $1 AND user_id = $2', [params.id, userId]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Speaking Topics DELETE API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message || String(error) }, { status: 500 });
  }
}

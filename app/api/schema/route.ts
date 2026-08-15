import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await db.connect();
    try {
      const { rows } = await client.query(`
        SELECT table_name, column_name, data_type, character_maximum_length, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `);
      return NextResponse.json(rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch schema', message: error?.message || String(error) }, { status: 500 });
  }
}

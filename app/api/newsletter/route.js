import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 }); }
  const email = (body?.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
  const { error } = await supabaseAdmin().from('newsletter_subscribers').upsert({ email }, { onConflict: 'email' });
  if (error) return NextResponse.json({ error: 'Không lưu được' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

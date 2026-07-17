import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 }); }

  const { full_name, email, phone, organization, note, course_id, session_id, kind } = body || {};
  if (!full_name || full_name.trim().length < 2) return NextResponse.json({ error: 'Thiếu họ tên' }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });

  const { error } = await supabaseAdmin().from('registrations').insert({
    full_name: full_name.trim().slice(0, 200),
    email: email.trim().slice(0, 200),
    phone: (phone || '').slice(0, 30) || null,
    organization: (organization || '').slice(0, 300) || null,
    note: (note || '').slice(0, 2000) || null,
    course_id: course_id || null,
    session_id: session_id || null,
    kind: ['enroll', 'consult', 'business'].includes(kind) ? kind : 'enroll',
  });
  if (error) return NextResponse.json({ error: 'Không lưu được, thử lại sau' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

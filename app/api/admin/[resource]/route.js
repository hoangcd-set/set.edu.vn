import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAdmin } from '../../../../lib/adminAuth';

// Bảng cho phép quản trị và cột sắp xếp mặc định
const TABLES = {
  registrations: { order: 'created_at', desc: true },
  posts: { order: 'created_at', desc: true },
  certificates: { order: 'created_at', desc: true },
  course_sessions: { order: 'starts_on', desc: false },
  courses: { order: 'code', desc: false },
  instructors: { order: 'full_name', desc: false },
  partners: { order: 'sort_order', desc: false },
};

async function guard(req, params) {
  const { resource } = await params;
  if (!TABLES[resource]) return [null, null, NextResponse.json({ error: 'Tài nguyên không hợp lệ' }, { status: 404 })];
  const user = await requireAdmin(req);
  if (!user) return [null, null, NextResponse.json({ error: 'Chưa đăng nhập hoặc không có quyền' }, { status: 401 })];
  return [resource, user, null];
}

export async function GET(req, { params }) {
  const [resource, , err] = await guard(req, params);
  if (err) return err;
  const cfg = TABLES[resource];
  const { data, error } = await supabaseAdmin().from(resource).select('*')
    .order(cfg.order, { ascending: !cfg.desc }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req, { params }) {
  const [resource, , err] = await guard(req, params);
  if (err) return err;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'JSON không hợp lệ' }, { status: 400 });
  const { data, error } = await supabaseAdmin().from(resource).insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req, { params }) {
  const [resource, , err] = await guard(req, params);
  if (err) return err;
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
  const { id, ...fields } = body;
  const { data, error } = await supabaseAdmin().from(resource).update(fields).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req, { params }) {
  const [resource, , err] = await guard(req, params);
  if (err) return err;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
  const { error } = await supabaseAdmin().from(resource).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

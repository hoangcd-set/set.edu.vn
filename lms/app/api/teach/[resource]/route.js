import { NextResponse } from 'next/server';
import { supabaseAdmin, userFromRequest, isAdmin } from '../../../../lib/supabase';

const TABLES = {
  lms_modules: { order: 'sort_order' },
  lms_lessons: { order: 'sort_order' },
  lms_quiz_questions: { order: 'sort_order' },
  lms_enrollments: { order: 'enrolled_at' },
};

async function guard(req) {
  const user = await userFromRequest(req);
  if (!isAdmin(user)) return null;
  return user;
}

export async function GET(req, { params }) {
  const { resource } = await params;
  if (!(await guard(req))) return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
  const admin = supabaseAdmin();
  const url = new URL(req.url);

  if (resource === 'learners') {
    // báo cáo tiến độ theo khóa
    const courseId = url.searchParams.get('course_id');
    const { data: enrolls } = await admin.from('lms_enrollments').select('user_id,status,enrolled_at').eq('course_id', courseId);
    const { data: mods } = await admin.from('lms_modules').select('id').eq('course_id', courseId);
    const modIds = (mods || []).map((m) => m.id);
    const { data: lessons } = modIds.length ? await admin.from('lms_lessons').select('id').in('module_id', modIds) : { data: [] };
    const lessonIds = (lessons || []).map((l) => l.id);
    const out = [];
    for (const e of enrolls || []) {
      const { data: u } = await admin.auth.admin.getUserById(e.user_id);
      const { count } = lessonIds.length
        ? await admin.from('lms_progress').select('id', { count: 'exact', head: true }).eq('user_id', e.user_id).in('lesson_id', lessonIds)
        : { count: 0 };
      out.push({ email: u?.user?.email, full_name: u?.user?.user_metadata?.full_name, status: e.status,
        completed: count || 0, total: lessonIds.length });
    }
    return NextResponse.json({ data: out });
  }

  if (!TABLES[resource]) return NextResponse.json({ error: 'Tài nguyên không hợp lệ' }, { status: 404 });
  let q = admin.from(resource).select('*').order(TABLES[resource].order, { ascending: true }).limit(500);
  for (const k of ['course_id', 'module_id', 'lesson_id']) {
    const v = url.searchParams.get(k); if (v) q = q.eq(k, v);
  }
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req, { params }) {
  const { resource } = await params;
  if (!(await guard(req))) return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
  const admin = supabaseAdmin();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'JSON không hợp lệ' }, { status: 400 });

  if (resource === 'enroll') {
    // tạo (hoặc tìm) tài khoản học viên rồi ghi danh vào khóa
    const { email, full_name, course_id, password } = body;
    if (!email || !course_id) return NextResponse.json({ error: 'Thiếu email/khóa học' }, { status: 400 });
    let userId = null, created = false, tempPass = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (existing) userId = existing.id;
    else {
      tempPass = password || 'Set@' + Math.random().toString(36).slice(2, 10);
      const { data: nu, error: ce } = await admin.auth.admin.createUser({
        email, password: tempPass, email_confirm: true, user_metadata: { full_name: full_name || '' },
      });
      if (ce) return NextResponse.json({ error: ce.message }, { status: 500 });
      userId = nu.user.id; created = true;
    }
    const { error: ee } = await admin.from('lms_enrollments').upsert({ user_id: userId, course_id }, { onConflict: 'user_id,course_id' });
    if (ee) return NextResponse.json({ error: ee.message }, { status: 500 });
    return NextResponse.json({ ok: true, created, tempPass });
  }

  if (!TABLES[resource]) return NextResponse.json({ error: 'Tài nguyên không hợp lệ' }, { status: 404 });
  const { data, error } = await admin.from(resource).insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req, { params }) {
  const { resource } = await params;
  if (!(await guard(req))) return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
  if (!TABLES[resource]) return NextResponse.json({ error: 'Tài nguyên không hợp lệ' }, { status: 404 });
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
  const { id, ...fields } = body;
  const { data, error } = await supabaseAdmin().from(resource).update(fields).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req, { params }) {
  const { resource } = await params;
  if (!(await guard(req))) return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
  if (!TABLES[resource]) return NextResponse.json({ error: 'Tài nguyên không hợp lệ' }, { status: 404 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
  const { error } = await supabaseAdmin().from(resource).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

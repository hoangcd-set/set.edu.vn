import { NextResponse } from 'next/server';
import { supabaseAdmin, userFromRequest } from '../../../../lib/supabase';

// Cấp chứng nhận hoàn thành: chỉ khi người học đã hoàn thành 100% bài học của khóa.
// Sổ cấp phát dùng chung bảng certificates của set.edu.vn (tra cứu tại /verify).

async function loadState(admin, user, courseId) {
  const { data: enroll } = await admin.from('lms_enrollments')
    .select('id,status').eq('user_id', user.id).eq('course_id', courseId).maybeSingle();
  if (!enroll) return { error: 'Bạn chưa được ghi danh khóa học này', code: 403 };
  const { data: course } = await admin.from('courses').select('id,title,duration_hours').eq('id', courseId).single();
  if (!course) return { error: 'Không tìm thấy khóa học', code: 404 };
  const { data: mods } = await admin.from('lms_modules').select('id').eq('course_id', courseId);
  const modIds = (mods || []).map((m) => m.id);
  const { data: lessons } = modIds.length
    ? await admin.from('lms_lessons').select('id').in('module_id', modIds) : { data: [] };
  const lessonIds = (lessons || []).map((l) => l.id);
  const { count } = lessonIds.length
    ? await admin.from('lms_progress').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('lesson_id', lessonIds)
    : { count: 0 };
  const learnerName = user.user_metadata?.full_name || user.email;
  const { data: certs } = await admin.from('certificates')
    .select('*').eq('course_id', courseId).eq('learner_name', learnerName).eq('status', 'valid')
    .order('created_at', { ascending: false }).limit(1);
  return {
    enroll, course, learnerName,
    total: lessonIds.length, completed: count || 0,
    complete: lessonIds.length > 0 && (count || 0) >= lessonIds.length,
    cert: certs?.[0] || null,
  };
}

async function nextCertNo(admin) {
  const year = new Date().getFullYear();
  const prefix = `SET-${year}-`;
  const { data } = await admin.from('certificates')
    .select('cert_no').like('cert_no', prefix + '%')
    .order('cert_no', { ascending: false }).limit(1);
  const last = data?.[0] ? parseInt(data[0].cert_no.slice(prefix.length), 10) : 0;
  return prefix + String(last + 1).padStart(4, '0');
}

export async function GET(req) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  const courseId = new URL(req.url).searchParams.get('course_id');
  if (!courseId) return NextResponse.json({ error: 'Thiếu course_id' }, { status: 400 });
  const s = await loadState(supabaseAdmin(), user, courseId);
  if (s.error) return NextResponse.json({ error: s.error }, { status: s.code });
  return NextResponse.json({ complete: s.complete, completed: s.completed, total: s.total, cert: s.cert });
}

export async function POST(req) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const courseId = body?.course_id;
  if (!courseId) return NextResponse.json({ error: 'Thiếu course_id' }, { status: 400 });
  const admin = supabaseAdmin();
  const s = await loadState(admin, user, courseId);
  if (s.error) return NextResponse.json({ error: s.error }, { status: s.code });
  if (s.cert) return NextResponse.json({ cert: s.cert, existing: true });
  if (!s.complete) {
    return NextResponse.json({ error: `Bạn mới hoàn thành ${s.completed}/${s.total} bài học — hoàn thành toàn bộ để được cấp chứng nhận.` }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  let cert = null;
  // cert_no có ràng buộc unique — thử lại nếu trùng số do cấp đồng thời
  for (let attempt = 0; attempt < 3 && !cert; attempt++) {
    const cert_no = await nextCertNo(admin);
    const { data, error } = await admin.from('certificates').insert({
      cert_no,
      learner_name: s.learnerName,
      course_id: courseId,
      course_title: s.course.title,
      duration_hours: s.course.duration_hours,
      completed_on: today,
      issued_on: today,
      result: 'Hoàn thành',
    }).select().single();
    if (!error) cert = data;
    else if (!/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  if (!cert) return NextResponse.json({ error: 'Không cấp được số chứng nhận, vui lòng thử lại' }, { status: 500 });
  await admin.from('lms_enrollments').update({ status: 'completed' }).eq('id', s.enroll.id);
  return NextResponse.json({ cert });
}

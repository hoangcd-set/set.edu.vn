import { NextResponse } from 'next/server';
import { supabaseAdmin, userFromRequest } from '../../../../../lib/supabase';

async function ensureEnrolled(admin, userId, lessonId) {
  const { data: lesson } = await admin.from('lms_lessons').select('id,module_id,pass_percent').eq('id', lessonId).single();
  if (!lesson) return [null, null];
  const { data: mod } = await admin.from('lms_modules').select('course_id').eq('id', lesson.module_id).single();
  const { data: enr } = await admin.from('lms_enrollments').select('id')
    .eq('user_id', userId).eq('course_id', mod?.course_id).in('status', ['active', 'completed']).maybeSingle();
  return [lesson, enr];
}

export async function GET(req, { params }) {
  const { lessonId } = await params;
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  const admin = supabaseAdmin();
  const [lesson, enr] = await ensureEnrolled(admin, user.id, lessonId);
  if (!lesson || !enr) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  const { data } = await admin.from('lms_quiz_questions')
    .select('id,question,options,sort_order').eq('lesson_id', lessonId).order('sort_order');
  return NextResponse.json({ questions: data || [] });
}

export async function POST(req, { params }) {
  const { lessonId } = await params;
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  const admin = supabaseAdmin();
  const [lesson, enr] = await ensureEnrolled(admin, user.id, lessonId);
  if (!lesson || !enr) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const answers = body?.answers || {};
  const { data: qs } = await admin.from('lms_quiz_questions').select('id,correct_index').eq('lesson_id', lessonId);
  if (!qs?.length) return NextResponse.json({ error: 'Bài chưa có câu hỏi' }, { status: 400 });

  const score = qs.filter((q) => answers[q.id] === q.correct_index).length;
  const total = qs.length;
  const passed = (100 * score) / total >= (lesson.pass_percent || 70);

  await admin.from('lms_quiz_attempts').insert({ user_id: user.id, lesson_id: lessonId, score, total, passed, answers });
  if (passed) await admin.from('lms_progress').upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' });
  return NextResponse.json({ score, total, passed });
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '../lib/supabase';

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, user: null, rows: [] });

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { location.assign('/login'); return; }
      // các khóa đã ghi danh
      const { data: enrolls } = await sb.from('lms_enrollments').select('course_id,status');
      const ids = (enrolls || []).map((e) => e.course_id);
      let courses = [];
      if (ids.length) {
        const { data } = await sb.from('courses').select('id,code,slug,title,duration_hours').in('id', ids);
        courses = data || [];
      }
      // tiến độ: tổng bài học mỗi khóa + số bài đã hoàn thành
      const { data: mods } = ids.length ? await sb.from('lms_modules').select('id,course_id').in('course_id', ids) : { data: [] };
      const modIds = (mods || []).map((m) => m.id);
      const { data: lessons } = modIds.length ? await sb.from('lms_lessons').select('id,module_id').in('module_id', modIds) : { data: [] };
      const { data: done } = await sb.from('lms_progress').select('lesson_id');
      const doneSet = new Set((done || []).map((d) => d.lesson_id));
      const modByCourse = {}; (mods || []).forEach((m) => { (modByCourse[m.course_id] ||= []).push(m.id); });
      const rows = courses.map((c) => {
        const ls = (lessons || []).filter((l) => (modByCourse[c.id] || []).includes(l.module_id));
        const total = ls.length, completed = ls.filter((l) => doneSet.has(l.id)).length;
        return { ...c, total, completed, pct: total ? Math.round(100 * completed / total) : 0,
          status: (enrolls || []).find((e) => e.course_id === c.id)?.status };
      });
      setState({ loading: false, user, rows });
    })();
  }, []);

  if (state.loading) return <div className="wrap py-16 text-ink-soft">Đang tải khóa học của bạn…</div>;

  return (
    <div className="wrap py-10">
      <span className="eyebrow">Xin chào, {state.user.user_metadata?.full_name || state.user.email}</span>
      <h1 className="text-3xl mt-1 mb-8">Khóa học của tôi</h1>
      {state.rows.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {state.rows.map((c) => (
            <Link key={c.id} href={`/course/${c.id}`} className="card p-5 hover:border-brand-700 hover:shadow-md transition flex flex-col gap-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-white bg-brand-900 rounded-md px-2 py-1 self-start">{c.code}</span>
              <b className="text-[17px] leading-snug">{c.title}</b>
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-ink-soft mb-1">
                  <span>{c.completed}/{c.total} bài học</span><span className="tabular-nums">{c.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-brand-100 overflow-hidden">
                  <div className="h-full bg-lime rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
                {c.pct === 100 && <p className="text-xs text-lime-dark font-bold mt-2 m-0">✓ Hoàn thành — mở khóa học để nhận chứng nhận</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center max-w-xl">
          <p className="font-semibold mb-1">Bạn chưa được ghi danh khóa học nào.</p>
          <p className="text-sm text-ink-soft m-0">Xem danh mục tại <a className="underline text-brand-700" href="https://set.edu.vn/khoa-hoc">set.edu.vn/khoa-hoc</a> — sau khi ghi danh và được Trung tâm xác nhận, khóa học sẽ xuất hiện ở đây.</p>
        </div>
      )}
    </div>
  );
}

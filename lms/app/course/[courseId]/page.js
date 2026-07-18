'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabaseBrowser } from '../../../lib/supabase';

const KIND_ICON = { video: '▶', text: '📖', file: '📎', quiz: '✎' };
const KIND_LABEL = { video: 'Video', text: 'Bài đọc', file: 'Tài liệu', quiz: 'Trắc nghiệm' };

/** Khối cấp chứng nhận — hiện khi người học hoàn thành 100% bài học */
function CertPanel({ courseId }) {
  const [s, setS] = useState({ loading: true, cert: null, err: '', claiming: false });

  const authed = async (method, body) => {
    const sb = supabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(`/api/lms/certificate${method === 'GET' ? `?course_id=${courseId}` : ''}`, {
      method,
      headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Lỗi máy chủ');
    return json;
  };

  useEffect(() => {
    authed('GET').then((r) => setS((p) => ({ ...p, loading: false, cert: r.cert })))
      .catch((e) => setS((p) => ({ ...p, loading: false, err: e.message })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const claim = async () => {
    setS((p) => ({ ...p, claiming: true, err: '' }));
    try {
      const r = await authed('POST', { course_id: courseId });
      setS((p) => ({ ...p, claiming: false, cert: r.cert }));
    } catch (e) { setS((p) => ({ ...p, claiming: false, err: e.message })); }
  };

  if (s.loading) return null;
  return (
    <div className="card p-6 mb-8 border-lime bg-brand-50">
      <p className="font-bold text-brand-900 m-0">🎓 Chúc mừng! Bạn đã hoàn thành toàn bộ khóa học.</p>
      {s.cert ? (
        <div className="mt-3 text-sm">
          <p className="m-0">Chứng nhận số <b className="tabular-nums">{s.cert.cert_no}</b> đã được cấp ngày {new Date(s.cert.issued_on).toLocaleDateString('vi-VN')}.</p>
          <a className="text-brand-700 underline font-semibold" target="_blank" rel="noreferrer"
            href={`https://set.edu.vn/verify?no=${s.cert.cert_no}`}>Xem và xác thực chứng nhận tại set.edu.vn/verify →</a>
        </div>
      ) : (
        <div className="mt-3">
          <button onClick={claim} disabled={s.claiming} className="btn-accent">
            {s.claiming ? 'Đang cấp…' : 'Nhận chứng nhận hoàn thành'}
          </button>
        </div>
      )}
      {s.err && <p className="text-sm text-red-700 mt-2 m-0">{s.err}</p>}
    </div>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { location.assign('/login'); return; }
      const [{ data: course }, { data: mods }, { data: done }] = await Promise.all([
        sb.from('courses').select('id,code,title,duration_hours').eq('id', courseId).single(),
        sb.from('lms_modules').select('id,title,sort_order').eq('course_id', courseId).order('sort_order'),
        sb.from('lms_progress').select('lesson_id'),
      ]);
      const modIds = (mods || []).map((m) => m.id);
      const { data: lessons } = modIds.length
        ? await sb.from('lms_lessons').select('id,module_id,title,kind,duration_min,sort_order').in('module_id', modIds).order('sort_order')
        : { data: [] };
      setD({ course, mods: mods || [], lessons: lessons || [], done: new Set((done || []).map((x) => x.lesson_id)) });
    })();
  }, [courseId]);

  if (!d) return <div className="wrap py-16 text-ink-soft">Đang tải chương trình học…</div>;
  if (!d.course) return <div className="wrap py-16">Không tìm thấy khóa học hoặc bạn chưa được ghi danh. <Link className="text-brand-700 underline" href="/">← Về trang chính</Link></div>;

  const all = d.lessons; const doneCount = all.filter((l) => d.done.has(l.id)).length;
  const next = all.find((l) => !d.done.has(l.id));

  return (
    <div className="wrap py-10 max-w-4xl">
      <Link href="/" className="text-sm text-ink-soft hover:text-brand-700">← Khóa học của tôi</Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mt-2 mb-8">
        <div>
          <span className="eyebrow">{d.course.code}</span>
          <h1 className="text-3xl mt-1">{d.course.title}</h1>
          <p className="text-sm text-ink-soft mt-2 m-0">{doneCount}/{all.length} bài học hoàn thành</p>
        </div>
        {next && <Link href={`/course/${courseId}/lesson/${next.id}`} className="btn-accent">Học tiếp: {next.title.slice(0, 30)}{next.title.length > 30 ? '…' : ''}</Link>}
      </div>
      {all.length > 0 && doneCount === all.length && <CertPanel courseId={courseId} />}
      {d.mods.map((m, i) => (
        <section key={m.id} className="mb-6">
          <h2 className="text-lg font-sans font-bold mb-3">Phần {i + 1}. {m.title}</h2>
          <div className="card divide-y divide-line">
            {d.lessons.filter((l) => l.module_id === m.id).map((l) => (
              <Link key={l.id} href={`/course/${courseId}/lesson/${l.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50">
                <span aria-hidden className="w-6 text-center">{d.done.has(l.id) ? '✅' : KIND_ICON[l.kind]}</span>
                <span className="flex-1">{l.title}</span>
                <span className="text-xs text-ink-soft">{KIND_LABEL[l.kind]}{l.duration_min ? ` · ${l.duration_min} phút` : ''}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {!d.mods.length && <p className="text-ink-soft">Nội dung khóa học đang được biên soạn.</p>}
    </div>
  );
}

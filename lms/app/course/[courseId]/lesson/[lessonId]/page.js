'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { marked } from 'marked';
import { supabaseBrowser, videoEmbed } from '../../../../../lib/supabase';

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.assign('/login'); return; }
    const [{ data: lesson }, { data: mods }, { data: done }] = await Promise.all([
      sb.from('lms_lessons').select('*').eq('id', lessonId).single(),
      sb.from('lms_modules').select('id').eq('course_id', courseId),
      sb.from('lms_progress').select('lesson_id'),
    ]);
    const modIds = (mods || []).map((m) => m.id);
    const { data: siblings } = modIds.length
      ? await sb.from('lms_lessons').select('id,module_id,title,sort_order').in('module_id', modIds).order('sort_order')
      : { data: [] };
    // sắp xếp theo module rồi bài
    const ordered = (siblings || []).sort((a, b) =>
      modIds.indexOf(a.module_id) - modIds.indexOf(b.module_id) || a.sort_order - b.sort_order);
    const idx = ordered.findIndex((l) => l.id === lessonId);
    setD({ lesson, ordered, idx, done: new Set((done || []).map((x) => x.lesson_id)), user });
  }
  useEffect(() => { load(); }, [lessonId]);

  async function markDone() {
    const sb = supabaseBrowser();
    const { error } = await sb.from('lms_progress').insert({ user_id: d.user.id, lesson_id: lessonId });
    if (!error || error.code === '23505') { setMsg('Đã ghi nhận hoàn thành ✓'); load(); }
    else setMsg('Lỗi: ' + error.message);
  }

  if (!d) return <div className="wrap py-16 text-ink-soft">Đang tải bài học…</div>;
  if (!d.lesson) return <div className="wrap py-16">Không truy cập được bài học (chưa ghi danh?). <Link className="text-brand-700 underline" href={`/course/${courseId}`}>← Về khóa học</Link></div>;

  const L = d.lesson;
  const emb = L.kind === 'video' ? videoEmbed(L.video_url) : null;
  const prev = d.idx > 0 ? d.ordered[d.idx - 1] : null;
  const next = d.idx < d.ordered.length - 1 ? d.ordered[d.idx + 1] : null;
  const isDone = d.done.has(L.id);

  return (
    <div className="wrap py-8 max-w-4xl">
      <Link href={`/course/${courseId}`} className="text-sm text-ink-soft hover:text-brand-700">← Chương trình học</Link>
      <h1 className="text-2xl lg:text-3xl mt-2 mb-5">{L.title}</h1>

      {L.kind === 'video' && emb && (
        <div className="card overflow-hidden mb-5">
          {emb.type === 'iframe'
            ? <div className="aspect-video"><iframe src={emb.src} className="w-full h-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen title={L.title} /></div>
            : <video src={emb.src} controls className="w-full aspect-video bg-black" />}
        </div>
      )}
      {L.file_url && (
        <a href={L.file_url} target="_blank" className="card flex items-center gap-3 px-4 py-3 mb-5 hover:border-brand-700">
          <span aria-hidden>📎</span><span className="font-semibold">Tải tài liệu bài học</span>
          <span className="text-xs text-ink-soft truncate">{L.file_url.split('/').pop()}</span>
        </a>
      )}
      {L.content_md && (
        <article className="card p-6 mb-5 space-y-3 leading-relaxed [&_h2]:text-xl [&_h2]:mt-4 [&_a]:text-brand-700 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:text-sm"
          dangerouslySetInnerHTML={{ __html: marked.parse(L.content_md) }} />
      )}
      {L.kind === 'quiz' && <Quiz lessonId={L.id} passPercent={L.pass_percent} onPassed={load} />}

      <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-line">
        {prev && <Link href={`/course/${courseId}/lesson/${prev.id}`} className="btn border border-line">← Bài trước</Link>}
        {L.kind !== 'quiz' && !isDone && <button onClick={markDone} className="btn-accent">Đánh dấu hoàn thành ✓</button>}
        {isDone && <span className="text-lime-dark font-bold text-sm">✓ Đã hoàn thành</span>}
        {next && <Link href={`/course/${courseId}/lesson/${next.id}`} className="btn-green ml-auto">Bài tiếp theo →</Link>}
        {msg && <span className="text-sm text-ink-soft">{msg}</span>}
      </div>
    </div>
  );
}

function Quiz({ lessonId, passPercent, onPassed }) {
  const [qs, setQs] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const res = await fetch(`/api/lms/quiz/${lessonId}`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
      const j = await res.json();
      setQs(res.ok ? j.questions : []);
    })();
  }, [lessonId]);

  async function submit() {
    setBusy(true);
    const sb = supabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    const res = await fetch(`/api/lms/quiz/${lessonId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ answers }),
    });
    const j = await res.json();
    setResult(j); setBusy(false);
    if (j.passed) onPassed();
  }

  if (!qs) return <p className="text-ink-soft">Đang tải câu hỏi…</p>;
  if (!qs.length) return <p className="text-ink-soft">Bộ câu hỏi của bài này đang được biên soạn theo Đề cương đã thẩm định — sẽ phát hành trước ngày khai giảng. Bạn có thể học tiếp các bài khác.</p>;

  return (
    <div className="card p-6">
      <p className="text-sm text-ink-soft mt-0">Trả lời đúng tối thiểu <b>{passPercent}%</b> để hoàn thành bài học.</p>
      <ol className="grid gap-5 list-none p-0 m-0">
        {qs.map((q, qi) => (
          <li key={q.id}>
            <p className="font-semibold mb-2">Câu {qi + 1}. {q.question}</p>
            <div className="grid gap-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm ${answers[q.id] === oi ? 'border-brand-700 bg-brand-100' : 'border-line'}`}>
                  <input type="radio" name={q.id} checked={answers[q.id] === oi} onChange={() => setAnswers({ ...answers, [q.id]: oi })} />
                  {opt}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {result && (
        <div className={`mt-5 p-4 rounded-xl ${result.passed ? 'bg-brand-100 text-brand-900' : 'bg-red-50 text-red-700'}`} role="status">
          <b>{result.passed ? '✓ Đạt' : '✕ Chưa đạt'}</b> — đúng {result.score}/{result.total} câu ({Math.round(100 * result.score / result.total)}%).
          {!result.passed && ' Bạn có thể làm lại.'}
        </div>
      )}
      <button onClick={submit} disabled={busy || Object.keys(answers).length < qs.length} className="btn-green mt-5">
        {busy ? 'Đang chấm…' : 'Nộp bài'}
      </button>
    </div>
  );
}

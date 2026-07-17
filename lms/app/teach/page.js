'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

const KINDS = { video: 'Video', text: 'Bài đọc', file: 'Tài liệu', quiz: 'Trắc nghiệm' };
const btn = 'px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer';

export default function TeachPage() {
  const [session, setSession] = useState(undefined);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [tab, setTab] = useState('builder');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    sb.from('courses').select('id,code,title').order('code').then(({ data }) => setCourses(data || []));
  }, []);

  const api = useCallback(async (path, opts = {}) => {
    const res = await fetch(`/api/teach/${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}`, ...(opts.headers || {}) },
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || res.statusText);
    return j;
  }, [session]);

  if (session === undefined) return <div className="wrap py-16 text-ink-soft">Đang tải…</div>;
  if (!session) return <div className="wrap py-16">Vui lòng <a href="/login" className="text-brand-700 underline">đăng nhập</a> bằng tài khoản quản trị để soạn khóa học.</div>;

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-3xl">Soạn khóa học (LMS)</h1>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="inp max-w-md">
          <option value="">— Chọn khóa học —</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mb-5">
        {[['builder', 'Chương trình & bài học'], ['enroll', 'Ghi danh học viên'], ['report', 'Tiến độ học viên']].map(([k, v]) => (
          <button key={k} onClick={() => setTab(k)} className={`${btn} ${tab === k ? 'bg-brand-700 text-white' : 'bg-white border border-line'}`}>{v}</button>
        ))}
      </div>
      {msg && <p className="text-sm text-brand-700 mb-4" role="status">{msg}</p>}
      {!courseId ? <p className="text-ink-soft">Chọn một khóa học để bắt đầu.</p> : (
        <>
          {tab === 'builder' && <Builder api={api} courseId={courseId} onMsg={setMsg} />}
          {tab === 'enroll' && <Enroll api={api} courseId={courseId} onMsg={setMsg} />}
          {tab === 'report' && <Report api={api} courseId={courseId} onMsg={setMsg} />}
        </>
      )}
    </div>
  );
}

function Builder({ api, courseId, onMsg }) {
  const [mods, setMods] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [editing, setEditing] = useState(null); // lesson đang sửa

  const reload = useCallback(async () => {
    const m = await api(`lms_modules?course_id=${courseId}`);
    setMods(m.data);
    const all = [];
    for (const mod of m.data) {
      const l = await api(`lms_lessons?module_id=${mod.id}`);
      all.push(...l.data);
    }
    setLessons(all);
  }, [api, courseId]);
  useEffect(() => { reload().catch((e) => onMsg('Lỗi tải: ' + e.message)); }, [reload]);

  async function addModule() {
    const title = prompt('Tên học phần (VD: Phần 1. Tổng quan):');
    if (!title) return;
    await api('lms_modules', { method: 'POST', body: JSON.stringify({ course_id: courseId, title, sort_order: mods.length + 1 }) });
    reload();
  }
  async function addLesson(moduleId) {
    const title = prompt('Tên bài học:');
    if (!title) return;
    const count = lessons.filter((l) => l.module_id === moduleId).length;
    const { data } = await api('lms_lessons', { method: 'POST', body: JSON.stringify({ module_id: moduleId, title, kind: 'text', sort_order: count + 1 }) });
    setEditing(data); reload();
  }

  if (editing) return <LessonEditor api={api} lesson={editing} onClose={() => { setEditing(null); reload(); }} onMsg={onMsg} />;

  return (
    <div>
      <button onClick={addModule} className="btn-accent mb-4">+ Thêm học phần</button>
      {mods.map((m) => (
        <div key={m.id} className="card mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-brand-50 rounded-t-2xl">
            <b>{m.title}</b>
            <div className="flex gap-2">
              <button className={`${btn} border border-line bg-white`} onClick={() => addLesson(m.id)}>+ Bài học</button>
              <button className={`${btn} border border-red-200 text-red-700 bg-white`} onClick={async () => { if (confirm('Xóa học phần và toàn bộ bài học?')) { await api(`lms_modules?id=${m.id}`, { method: 'DELETE' }); reload(); } }}>Xóa</button>
            </div>
          </div>
          {lessons.filter((l) => l.module_id === m.id).map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line/60 last:border-0 text-sm">
              <span className="text-xs font-bold uppercase text-lime-dark w-20">{KINDS[l.kind]}</span>
              <span className="flex-1">{l.title}</span>
              <button className={`${btn} border border-line`} onClick={() => setEditing(l)}>Sửa</button>
              <button className={`${btn} border border-red-200 text-red-700`} onClick={async () => { if (confirm('Xóa bài học?')) { await api(`lms_lessons?id=${l.id}`, { method: 'DELETE' }); reload(); } }}>Xóa</button>
            </div>
          ))}
        </div>
      ))}
      {!mods.length && <p className="text-ink-soft">Chưa có học phần nào — bấm "+ Thêm học phần".</p>}
    </div>
  );
}

function LessonEditor({ api, lesson, onClose, onMsg }) {
  const [f, setF] = useState(lesson);
  const [qs, setQs] = useState([]);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    if (f.kind === 'quiz') api(`lms_quiz_questions?lesson_id=${lesson.id}`).then((r) => setQs(r.data)).catch(() => {});
  }, [f.kind, api, lesson.id]);

  async function save() {
    const { id, ...fields } = f;
    await api('lms_lessons', { method: 'PATCH', body: JSON.stringify({ id, title: fields.title, kind: fields.kind, content_md: fields.content_md, video_url: fields.video_url, file_url: fields.file_url, duration_min: fields.duration_min ? +fields.duration_min : null, pass_percent: fields.pass_percent ? +fields.pass_percent : 70, sort_order: +fields.sort_order || 0, is_preview: !!fields.is_preview }) });
    onMsg('Đã lưu bài học ✓'); onClose();
  }
  async function addQ() {
    const question = prompt('Nội dung câu hỏi:'); if (!question) return;
    const opts = [];
    for (let i = 0; i < 4; i++) { const o = prompt(`Phương án ${String.fromCharCode(65 + i)} (bỏ trống để dừng):`); if (!o) break; opts.push(o); }
    if (opts.length < 2) return alert('Cần tối thiểu 2 phương án');
    const ci = parseInt(prompt(`Đáp án đúng (1-${opts.length}):`), 10) - 1;
    await api('lms_quiz_questions', { method: 'POST', body: JSON.stringify({ lesson_id: lesson.id, question, options: opts, correct_index: ci, sort_order: qs.length + 1 }) });
    const r = await api(`lms_quiz_questions?lesson_id=${lesson.id}`); setQs(r.data);
  }

  return (
    <div className="card p-5 grid gap-3 max-w-3xl">
      <div className="flex justify-between items-center"><h2 className="text-xl m-0">Sửa bài học</h2>
        <button onClick={onClose} className={`${btn} border border-line`}>← Quay lại</button></div>
      <input value={f.title} onChange={(e) => set('title', e.target.value)} className="inp" placeholder="Tên bài học" />
      <div className="grid sm:grid-cols-3 gap-3">
        <select value={f.kind} onChange={(e) => set('kind', e.target.value)} className="inp">
          {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="number" value={f.duration_min || ''} onChange={(e) => set('duration_min', e.target.value)} className="inp" placeholder="Thời lượng (phút)" />
        <input type="number" value={f.sort_order || 0} onChange={(e) => set('sort_order', e.target.value)} className="inp" placeholder="Thứ tự" />
      </div>
      {f.kind === 'video' && <input value={f.video_url || ''} onChange={(e) => set('video_url', e.target.value)} className="inp" placeholder="Link video (YouTube / Vimeo / mp4 trên media.set.edu.vn)" />}
      {(f.kind === 'file' || f.kind === 'video') && <input value={f.file_url || ''} onChange={(e) => set('file_url', e.target.value)} className="inp" placeholder="Link tài liệu đính kèm (media.set.edu.vn/...)" />}
      {f.kind !== 'quiz' && <textarea rows={10} value={f.content_md || ''} onChange={(e) => set('content_md', e.target.value)} className="inp font-mono" placeholder="Nội dung bài đọc / mô tả (Markdown)" />}
      {f.kind === 'quiz' && (
        <div className="border border-line rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <b>Câu hỏi ({qs.length})</b>
            <div className="flex gap-2 items-center text-sm">Điểm đạt: <input type="number" value={f.pass_percent || 70} onChange={(e) => set('pass_percent', e.target.value)} className="inp !w-20" />%
              <button onClick={addQ} className={`${btn} bg-brand-100 border border-line`}>+ Câu hỏi</button></div>
          </div>
          {qs.map((q, i) => (
            <div key={q.id} className="flex gap-2 items-start text-sm border-t border-line/60 py-2">
              <span className="flex-1"><b>Câu {i + 1}.</b> {q.question}<br /><span className="text-ink-soft">{(q.options || []).map((o, oi) => `${String.fromCharCode(65 + oi)}. ${o}`).join(' · ')} — đáp án: {String.fromCharCode(65 + q.correct_index)}</span></span>
              <button className={`${btn} border border-red-200 text-red-700`} onClick={async () => { await api(`lms_quiz_questions?id=${q.id}`, { method: 'DELETE' }); const r = await api(`lms_quiz_questions?lesson_id=${lesson.id}`); setQs(r.data); }}>Xóa</button>
            </div>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.is_preview} onChange={(e) => set('is_preview', e.target.checked)} /> Cho xem thử (không cần ghi danh)</label>
      <button onClick={save} className="btn-green self-start">Lưu bài học</button>
    </div>
  );
}

function Enroll({ api, courseId, onMsg }) {
  const [f, setF] = useState({});
  const [result, setResult] = useState(null);
  async function go() {
    try {
      const r = await api('enroll', { method: 'POST', body: JSON.stringify({ ...f, course_id: courseId }) });
      setResult(r); onMsg('Đã ghi danh ✓'); setF({});
    } catch (e) { onMsg('Lỗi: ' + e.message); }
  }
  return (
    <div className="card p-5 grid gap-3 max-w-lg">
      <h2 className="text-xl m-0">Ghi danh học viên vào khóa</h2>
      <input value={f.full_name || ''} onChange={(e) => setF({ ...f, full_name: e.target.value })} className="inp" placeholder="Họ tên học viên" />
      <input value={f.email || ''} onChange={(e) => setF({ ...f, email: e.target.value })} className="inp" placeholder="Email học viên *" type="email" />
      <input value={f.password || ''} onChange={(e) => setF({ ...f, password: e.target.value })} className="inp" placeholder="Mật khẩu (bỏ trống = tự sinh)" />
      <button onClick={go} disabled={!f.email} className="btn-green">Tạo tài khoản & ghi danh</button>
      {result && (
        <div className="bg-brand-100 rounded-xl p-4 text-sm">
          ✓ Ghi danh thành công.{result.created && (<><br />Tài khoản mới — mật khẩu tạm: <b className="font-mono">{result.tempPass}</b> (gửi cho học viên, đề nghị đổi sau lần đăng nhập đầu).</>)}
        </div>
      )}
    </div>
  );
}

function Report({ api, courseId, onMsg }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api(`learners?course_id=${courseId}`).then((r) => setRows(r.data)).catch((e) => onMsg('Lỗi: ' + e.message)); }, [api, courseId, onMsg]);
  if (!rows) return <p className="text-ink-soft">Đang tổng hợp…</p>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b border-line [&>th]:p-3 text-ink-soft"><th>Học viên</th><th>Email</th><th>Tiến độ</th><th>Trạng thái</th></tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i} className="border-b border-line/60 [&>td]:p-3">
            <td className="font-semibold">{r.full_name || '—'}</td><td>{r.email}</td>
            <td className="tabular-nums">{r.completed}/{r.total} bài ({r.total ? Math.round(100 * r.completed / r.total) : 0}%)</td>
            <td>{r.status}</td>
          </tr>))}
          {!rows.length && <tr><td colSpan={4} className="p-4 text-ink-soft">Chưa có học viên ghi danh.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

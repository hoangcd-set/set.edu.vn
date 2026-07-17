'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cykmszpgfnznjwtghwtt.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0Z-BkHLENWptNVN0erWxcA_RhffHL15'
);

const CATS = { 'hoat-dong': 'Tin hoạt động', 'su-kien': 'Sự kiện', 'ban-tin': 'Bản tin', 'cau-chuyen': 'Câu chuyện', 'tuyen-sinh': 'Tuyển sinh' };
const REG_STATUS = { new: 'Mới', contacted: 'Đã liên hệ', confirmed: 'Xác nhận', rejected: 'Từ chối' };
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

const inp = 'border border-line rounded-lg px-3 py-2 w-full bg-white text-sm';
const btn = 'px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer';

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('registrations');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const api = useCallback(async (path, opts = {}) => {
    const res = await fetch(`/api/admin/${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}`, ...(opts.headers || {}) },
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || res.statusText);
    return j;
  }, [session]);

  if (!session) return <Login onMsg={setMsg} msg={msg} />;

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl">Quản trị SET</h1>
        <div className="text-sm text-ink-soft flex items-center gap-3">
          {session.user.email}
          <button className={`${btn} border border-line`} onClick={() => sb.auth.signOut()}>Đăng xuất</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {[['registrations', 'Ghi danh'], ['posts', 'Bài viết'], ['certificates', 'Chứng nhận'], ['course_sessions', 'Lịch khai giảng'], ['courses', 'Khóa học']].map(([k, v]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`${btn} ${tab === k ? 'bg-brand-700 text-white' : 'bg-white border border-line'}`}>{v}</button>
        ))}
      </div>
      {msg && <p className="text-sm mb-4 text-brand-700" role="status">{msg}</p>}
      {tab === 'registrations' && <Registrations api={api} onMsg={setMsg} />}
      {tab === 'posts' && <Posts api={api} onMsg={setMsg} token={session.access_token} />}
      {tab === 'certificates' && <Certs api={api} onMsg={setMsg} />}
      {tab === 'course_sessions' && <Sessions api={api} onMsg={setMsg} />}
      {tab === 'courses' && <Courses api={api} onMsg={setMsg} />}
    </div>
  );
}

function Login({ onMsg, msg }) {
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); onMsg('');
    const fd = new FormData(e.currentTarget);
    const { error } = await sb.auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') });
    if (error) onMsg('Đăng nhập thất bại: ' + error.message);
    setBusy(false);
  }
  return (
    <div className="wrap py-16 max-w-md">
      <h1 className="text-3xl mb-6">Đăng nhập quản trị</h1>
      <form onSubmit={submit} className="card p-6 grid gap-4">
        <input name="email" type="email" required placeholder="Email quản trị" className={inp} />
        <input name="password" type="password" required placeholder="Mật khẩu" className={inp} />
        {msg && <p className="text-sm text-red-700 m-0" role="alert">{msg}</p>}
        <button disabled={busy} className="btn-green justify-center disabled:opacity-60">{busy ? 'Đang kiểm tra…' : 'Đăng nhập'}</button>
      </form>
    </div>
  );
}

function useList(api, resource, onMsg) {
  const [rows, setRows] = useState([]);
  const reload = useCallback(() => api(resource).then((r) => setRows(r.data)).catch((e) => onMsg('Lỗi tải: ' + e.message)), [api, resource, onMsg]);
  useEffect(() => { reload(); }, [reload]);
  return [rows, reload];
}

function Registrations({ api, onMsg }) {
  const [rows, reload] = useList(api, 'registrations', onMsg);
  async function setStatus(id, status) {
    try { await api('registrations', { method: 'PATCH', body: JSON.stringify({ id, status }) }); reload(); }
    catch (e) { onMsg('Lỗi: ' + e.message); }
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b border-line [&>th]:p-3 text-ink-soft">
          <th>Ngày</th><th>Họ tên</th><th>Liên hệ</th><th>Loại</th><th>Ghi chú</th><th>Trạng thái</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line/60 [&>td]:p-3 align-top">
              <td className="whitespace-nowrap tabular-nums">{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
              <td className="font-semibold">{r.full_name}<br /><span className="font-normal text-ink-soft">{r.organization}</span></td>
              <td>{r.email}<br />{r.phone}</td>
              <td>{r.kind === 'business' ? 'Doanh nghiệp' : r.kind === 'consult' ? 'Tư vấn' : 'Ghi danh'}</td>
              <td className="max-w-[26ch]">{r.note}</td>
              <td>
                <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="border border-line rounded px-2 py-1">
                  {Object.entries(REG_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td className="p-4 text-ink-soft" colSpan={6}>Chưa có đăng ký nào.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Posts({ api, onMsg, token }) {
  const [rows, reload] = useList(api, 'posts', onMsg);
  const empty = { category: 'hoat-dong', title: '', excerpt: '', body_md: '', cover_url: '', is_published: false, event_starts_at: '', event_location: '' };
  const [form, setForm] = useState(null); // null = danh sách; object = đang soạn
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    try {
      const payload = { ...form };
      payload.slug = payload.slug || slugify(payload.title) || `bai-viet-${Date.now()}`;
      payload.published_at = payload.is_published ? (payload.published_at || new Date().toISOString()) : payload.published_at;
      payload.event_starts_at = payload.event_starts_at || null;
      const method = payload.id ? 'PATCH' : 'POST';
      await api('posts', { method, body: JSON.stringify(payload) });
      onMsg('Đã lưu bài viết ✓'); setForm(null); reload();
    } catch (e) { onMsg('Lỗi lưu: ' + e.message); }
  }
  async function upload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    onMsg('Đang tải ảnh…');
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const j = await res.json();
    if (res.ok) { set('cover_url', j.url); onMsg('Đã tải ảnh lên media.set.edu.vn ✓'); } else onMsg('Lỗi upload: ' + j.error);
  }

  if (form) return (
    <div className="card p-5 grid gap-3 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-3">
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inp}>
          {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} /> Xuất bản công khai</label>
      </div>
      <input placeholder="Tiêu đề" value={form.title} onChange={(e) => set('title', e.target.value)} className={inp} />
      <input placeholder="Tóm tắt (1-2 câu)" value={form.excerpt || ''} onChange={(e) => set('excerpt', e.target.value)} className={inp} />
      {form.category === 'su-kien' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="datetime-local" value={form.event_starts_at ? form.event_starts_at.slice(0, 16) : ''} onChange={(e) => set('event_starts_at', e.target.value ? new Date(e.target.value).toISOString() : '')} className={inp} />
          <input placeholder="Địa điểm sự kiện" value={form.event_location || ''} onChange={(e) => set('event_location', e.target.value)} className={inp} />
        </div>
      )}
      <div className="flex items-center gap-3 text-sm">
        <label className={`${btn} bg-brand-100 border border-line`}>Tải ảnh bìa<input type="file" accept="image/*" hidden onChange={upload} /></label>
        {form.cover_url && <a href={form.cover_url} target="_blank" className="text-brand-700 underline truncate max-w-[40ch]">{form.cover_url}</a>}
      </div>
      <textarea rows={14} placeholder="Nội dung (Markdown)" value={form.body_md || ''} onChange={(e) => set('body_md', e.target.value)} className={`${inp} font-mono`} />
      <div className="flex gap-3">
        <button onClick={save} className="btn-green">Lưu bài viết</button>
        <button onClick={() => setForm(null)} className={`${btn} border border-line`}>Hủy</button>
      </div>
    </div>
  );

  return (
    <div>
      <button onClick={() => setForm(empty)} className="btn-accent mb-4">+ Bài viết mới</button>
      <div className="card divide-y divide-line">
        {rows.map((p) => (
          <div key={p.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <div>
              <b>{p.title}</b>
              <div className="text-xs text-ink-soft">{CATS[p.category]} · {p.is_published ? '🟢 công khai' : '⚪ nháp'} · /tin-tuc/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              <button className={`${btn} border border-line`} onClick={() => setForm(p)}>Sửa</button>
              <button className={`${btn} border border-red-200 text-red-700`} onClick={async () => { if (confirm('Xóa bài này?')) { await api(`posts?id=${p.id}`, { method: 'DELETE' }); reload(); } }}>Xóa</button>
            </div>
          </div>
        ))}
        {!rows.length && <p className="p-4 text-ink-soft m-0">Chưa có bài viết.</p>}
      </div>
    </div>
  );
}

function Certs({ api, onMsg }) {
  const [rows, reload] = useList(api, 'certificates', onMsg);
  const year = new Date().getFullYear();
  const nextNo = useMemo(() => {
    const nums = rows.filter((r) => r.cert_no?.startsWith(`SET-${year}-`)).map((r) => parseInt(r.cert_no.split('-')[2], 10) || 0);
    return `SET-${year}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0')}`;
  }, [rows, year]);
  const [f, setF] = useState({});
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  async function create() {
    try {
      await api('certificates', { method: 'POST', body: JSON.stringify({
        cert_no: f.cert_no || nextNo, learner_name: f.learner_name, course_title: f.course_title,
        duration_hours: f.duration_hours ? +f.duration_hours : null,
        completed_on: f.completed_on, issued_on: f.issued_on || new Date().toISOString().slice(0, 10), result: f.result || 'Đạt',
      }) });
      onMsg(`Đã cấp chứng nhận ${f.cert_no || nextNo} ✓`); setF({}); reload();
    } catch (e) { onMsg('Lỗi: ' + e.message); }
  }
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-5 grid gap-3 self-start">
        <h3 className="text-lg m-0">Cấp chứng nhận mới</h3>
        <input placeholder={`Mã (tự động: ${nextNo})`} value={f.cert_no || ''} onChange={(e) => set('cert_no', e.target.value.toUpperCase())} className={inp} />
        <input placeholder="Họ tên học viên *" value={f.learner_name || ''} onChange={(e) => set('learner_name', e.target.value)} className={inp} />
        <input placeholder="Tên chương trình *" value={f.course_title || ''} onChange={(e) => set('course_title', e.target.value)} className={inp} />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Số giờ" value={f.duration_hours || ''} onChange={(e) => set('duration_hours', e.target.value)} className={inp} />
          <input placeholder="Kết quả (Đạt/Giỏi)" value={f.result || ''} onChange={(e) => set('result', e.target.value)} className={inp} />
        </div>
        <label className="text-xs text-ink-soft">Ngày hoàn thành *<input type="date" value={f.completed_on || ''} onChange={(e) => set('completed_on', e.target.value)} className={inp} /></label>
        <button onClick={create} disabled={!f.learner_name || !f.course_title || !f.completed_on} className="btn-green disabled:opacity-50">Cấp & ghi sổ</button>
      </div>
      <div className="card divide-y divide-line self-start">
        {rows.map((c) => (
          <div key={c.id} className="p-3 flex items-center justify-between gap-3 text-sm">
            <div><b className="tabular-nums">{c.cert_no}</b> — {c.learner_name}<div className="text-xs text-ink-soft">{c.course_title}</div></div>
            <div className="flex items-center gap-2">
              <a className="text-brand-700 underline" href={`/verify?no=${c.cert_no}`} target="_blank">verify</a>
              {c.status === 'valid'
                ? <button className={`${btn} border border-red-200 text-red-700`} onClick={async () => { await api('certificates', { method: 'PATCH', body: JSON.stringify({ id: c.id, status: 'revoked' }) }); reload(); }}>Thu hồi</button>
                : <span className="text-red-700 text-xs font-bold">ĐÃ THU HỒI</span>}
            </div>
          </div>
        ))}
        {!rows.length && <p className="p-4 text-ink-soft m-0">Chưa cấp chứng nhận nào.</p>}
      </div>
    </div>
  );
}

function Sessions({ api, onMsg }) {
  const [rows, reload] = useList(api, 'course_sessions', onMsg);
  const [courses, setCourses] = useState([]);
  useEffect(() => { api('courses').then((r) => setCourses(r.data)).catch(() => {}); }, [api]);
  const byId = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);
  const [f, setF] = useState({});
  async function add() {
    try {
      await api('course_sessions', { method: 'POST', body: JSON.stringify({ course_id: f.course_id, starts_on: f.starts_on, location: f.location || 'Trụ sở SET', seats: f.seats ? +f.seats : null }) });
      onMsg('Đã thêm lịch khai giảng ✓'); setF({}); reload();
    } catch (e) { onMsg('Lỗi: ' + e.message); }
  }
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card p-5 grid gap-3 self-start">
        <h3 className="text-lg m-0">Thêm đợt khai giảng</h3>
        <select value={f.course_id || ''} onChange={(e) => setF({ ...f, course_id: e.target.value })} className={inp}>
          <option value="">— Chọn khóa học —</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
        </select>
        <input type="date" value={f.starts_on || ''} onChange={(e) => setF({ ...f, starts_on: e.target.value })} className={inp} />
        <input placeholder="Địa điểm" value={f.location || ''} onChange={(e) => setF({ ...f, location: e.target.value })} className={inp} />
        <input type="number" placeholder="Số chỗ" value={f.seats || ''} onChange={(e) => setF({ ...f, seats: e.target.value })} className={inp} />
        <button onClick={add} disabled={!f.course_id || !f.starts_on} className="btn-green disabled:opacity-50">Thêm lịch</button>
      </div>
      <div className="card divide-y divide-line self-start">
        {rows.map((s) => (
          <div key={s.id} className="p-3 flex items-center justify-between gap-3 text-sm">
            <div><b className="tabular-nums">{new Date(s.starts_on).toLocaleDateString('vi-VN')}</b> — {byId[s.course_id]?.code || '?'}<div className="text-xs text-ink-soft">{s.location} · {s.seats || '∞'} chỗ · {s.status}</div></div>
            <select value={s.status} onChange={async (e) => { await api('course_sessions', { method: 'PATCH', body: JSON.stringify({ id: s.id, status: e.target.value }) }); reload(); }} className="border border-line rounded px-2 py-1">
              {['open', 'full', 'done', 'cancelled'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
        ))}
        {!rows.length && <p className="p-4 text-ink-soft m-0">Chưa có lịch khai giảng.</p>}
      </div>
    </div>
  );
}

function Courses({ api, onMsg }) {
  const [rows, reload] = useList(api, 'courses', onMsg);
  async function patch(id, fields) {
    try { await api('courses', { method: 'PATCH', body: JSON.stringify({ id, ...fields }) }); reload(); onMsg('Đã lưu ✓'); }
    catch (e) { onMsg('Lỗi: ' + e.message); }
  }
  return (
    <div className="card divide-y divide-line">
      {rows.map((c) => (
        <div key={c.id} className="p-4 grid sm:grid-cols-[1fr,140px,120px] gap-3 items-center">
          <div><b>{c.code}</b> — {c.title}<div className="text-xs text-ink-soft">/khoa-hoc/{c.slug} · {c.duration_hours} giờ</div></div>
          <input type="number" defaultValue={c.price_vnd || ''} placeholder="Học phí (đ)" className={inp}
            onBlur={(e) => { const v = e.target.value ? +e.target.value : null; if (v !== c.price_vnd) patch(c.id, { price_vnd: v }); }} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={c.is_published} onChange={(e) => patch(c.id, { is_published: e.target.checked })} /> Công khai
          </label>
        </div>
      ))}
    </div>
  );
}

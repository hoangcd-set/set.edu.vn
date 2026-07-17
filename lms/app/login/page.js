'use client';
import { useState } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

export default function LoginPage() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const fd = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: fd.get('email'), password: fd.get('password'),
    });
    if (error) { setErr('Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.'); setBusy(false); return; }
    location.assign('/');
  }
  return (
    <div className="wrap py-16 max-w-md">
      <span className="eyebrow">Cổng học tập SET</span>
      <h1 className="text-3xl mt-1 mb-2">Đăng nhập</h1>
      <p className="text-sm text-ink-soft mb-6">Tài khoản học tập (@set.edu.vn hoặc email đăng ký) do Trung tâm cấp khi bạn ghi danh khóa học.</p>
      <form onSubmit={submit} className="card p-6 grid gap-4">
        <label className="grid gap-1 text-sm font-medium">Email
          <input name="email" type="email" required autoComplete="email" className="inp font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">Mật khẩu
          <input name="password" type="password" required autoComplete="current-password" className="inp font-normal" />
        </label>
        {err && <p className="text-sm text-red-700 m-0" role="alert">{err}</p>}
        <button disabled={busy} className="btn-green justify-center">{busy ? 'Đang kiểm tra…' : 'Đăng nhập'}</button>
        <p className="text-xs text-ink-soft m-0">Chưa có tài khoản? Ghi danh khóa học tại <a className="underline" href="https://set.edu.vn/khoa-hoc">set.edu.vn/khoa-hoc</a> hoặc liên hệ info@set.edu.vn.</p>
      </form>
    </div>
  );
}

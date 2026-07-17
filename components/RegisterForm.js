'use client';
import { useState } from 'react';

export default function RegisterForm({ courseId, sessions = [], kind = 'enroll' }) {
  const [state, setState] = useState('idle'); // idle | sending | ok | error
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setState('sending');
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    payload.course_id = courseId || null;
    payload.kind = kind;
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gửi không thành công');
      setState('ok');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }

  if (state === 'ok')
    return (
      <div className="card p-6 bg-brand-100 border-brand-600 text-center">
        <p className="font-bold text-brand-900 m-0">Đã nhận đăng ký của bạn ✓</p>
        <p className="text-sm text-ink-soft mt-1 m-0">Trung tâm SET sẽ liên hệ trong 1-2 ngày làm việc qua email/điện thoại bạn cung cấp.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="card p-6 grid gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="grid gap-1 text-sm font-medium">
          Họ và tên <span className="text-red-600" aria-hidden>*</span>
          <input name="full_name" required minLength={2} className="border border-line rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Email <span className="text-red-600" aria-hidden>*</span>
          <input name="email" type="email" required className="border border-line rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Số điện thoại
          <input name="phone" type="tel" className="border border-line rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Đơn vị công tác
          <input name="organization" className="border border-line rounded-lg px-3 py-2.5 font-normal" />
        </label>
      </div>
      {sessions.length > 0 && (
        <label className="grid gap-1 text-sm font-medium">
          Đợt khai giảng
          <select name="session_id" className="border border-line rounded-lg px-3 py-2.5 font-normal bg-white">
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.starts_on).toLocaleDateString('vi-VN')} — {s.location || 'Trụ sở SET'}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="grid gap-1 text-sm font-medium">
        Ghi chú / nhu cầu cụ thể
        <textarea name="note" rows={3} className="border border-line rounded-lg px-3 py-2.5 font-normal" />
      </label>
      {state === 'error' && <p className="text-sm text-red-700 m-0" role="alert">Lỗi: {error}. Vui lòng thử lại hoặc email info@set.edu.vn.</p>}
      <button type="submit" disabled={state === 'sending'} className="btn-accent justify-center disabled:opacity-60">
        {state === 'sending' ? 'Đang gửi…' : kind === 'business' ? 'Gửi nhu cầu tư vấn doanh nghiệp' : 'Gửi đăng ký'}
      </button>
      <p className="text-xs text-ink-soft m-0">Thông tin của bạn được xử lý theo <a href="/chinh-sach-bao-mat" className="underline">Chính sách bảo mật & dữ liệu cá nhân</a> của Trung tâm SET.</p>
    </form>
  );
}

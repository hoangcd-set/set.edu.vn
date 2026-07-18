import { supabase, formatDate } from '../../lib/supabase';

export const metadata = {
  title: 'Xác thực chứng nhận',
  description: 'Tra cứu và xác thực Giấy chứng nhận hoàn thành chương trình đào tạo của Trung tâm SET theo mã định danh.',
};

export default async function VerifyPage({ searchParams }) {
  const { no } = await searchParams;
  let cert = null, searched = false;
  if (no) {
    searched = true;
    const { data } = await supabase.from('certificates').select('*').eq('cert_no', no.trim().toUpperCase()).single();
    cert = data;
  }

  return (
    <div className="wrap py-12 max-w-2xl">
      <span className="eyebrow">Công cụ xác thực</span>
      <h1 className="text-4xl mt-1 mb-3">Xác thực chứng nhận</h1>
      <p className="text-ink-soft mb-8">
        Nhập mã định danh in trên Giấy chứng nhận (dạng <b>SET-2026-0001</b>) hoặc quét mã QR.
        Sổ cấp phát chứng nhận được quản lý theo Quy chế đào tạo ban hành kèm Quyết định 12/2026/QĐ-ASTRI.
      </p>
      <form method="get" className="flex gap-3 mb-8">
        <label className="sr-only" htmlFor="no">Mã chứng nhận</label>
        <input id="no" name="no" defaultValue={no || ''} placeholder="SET-2026-0001" required
          className="border border-line rounded-xl px-4 py-3 flex-1 bg-white" />
        <button type="submit" className="btn-green">Tra cứu</button>
      </form>

      {searched && !cert && (
        <div className="card p-6 border-red-300 bg-red-50" role="alert">
          <b className="text-red-700">Không tìm thấy chứng nhận với mã "{no}".</b>
          <p className="text-sm text-ink-soft mt-1 m-0">Kiểm tra lại mã hoặc liên hệ cert@set.edu.vn để được hỗ trợ.</p>
        </div>
      )}

      {cert && (
        <div className={`card p-6 ${cert.status === 'valid' ? 'border-brand-600 bg-brand-100' : 'border-red-300 bg-red-50'}`}>
          <p className={`font-bold text-lg m-0 ${cert.status === 'valid' ? 'text-brand-900' : 'text-red-700'}`}>
            {cert.status === 'valid' ? '✓ Chứng nhận hợp lệ' : '✕ Chứng nhận đã bị thu hồi'}
          </p>
          <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 mt-4 text-[15px]">
            <dt className="text-ink-soft">Mã số</dt><dd className="font-bold tabular-nums m-0">{cert.cert_no}</dd>
            <dt className="text-ink-soft">Họ và tên</dt><dd className="font-bold m-0">{cert.learner_name}</dd>
            <dt className="text-ink-soft">Chương trình</dt><dd className="m-0">{cert.course_title}</dd>
            <dt className="text-ink-soft">Thời lượng</dt><dd className="m-0">{cert.duration_hours} giờ</dd>
            <dt className="text-ink-soft">Hoàn thành</dt><dd className="m-0 tabular-nums">{formatDate(cert.completed_on)}</dd>
            <dt className="text-ink-soft">Ngày cấp</dt><dd className="m-0 tabular-nums">{formatDate(cert.issued_on)}</dd>
            {cert.result && (<><dt className="text-ink-soft">Kết quả</dt><dd className="m-0">{cert.result}</dd></>)}
          </dl>
          <p className="text-xs text-ink-soft mt-4 m-0">
            Đơn vị cấp: Trung tâm Đào tạo và Công nghệ Hỗ trợ Đổi mới sáng tạo (SET) — Viện Nghiên cứu Công nghệ Hỗ trợ Nông nghiệp.
          </p>
          {cert.status === 'valid' && (
            <a href={`/verify/print?no=${cert.cert_no}`} className="inline-block mt-4 btn-green text-sm">🖨 Bản in chứng nhận (PDF)</a>
          )}
        </div>
      )}
    </div>
  );
}

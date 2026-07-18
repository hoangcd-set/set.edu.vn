import { supabase, formatDate } from '../../../lib/supabase';

export const metadata = { title: 'Bản in chứng nhận', robots: { index: false } };

/** Bản in Giấy chứng nhận hoàn thành — khổ ngang, in trực tiếp từ trình duyệt. */
export default async function CertPrintPage({ searchParams }) {
  const { no } = await searchParams;
  let cert = null;
  if (no) {
    const { data } = await supabase.from('certificates').select('*').eq('cert_no', no.trim().toUpperCase()).single();
    if (data?.status === 'valid') cert = data;
  }

  if (!cert) {
    return (
      <div className="wrap py-16 max-w-xl">
        <h1 className="text-2xl mb-2">Không tìm thấy chứng nhận hợp lệ</h1>
        <p className="text-ink-soft">Kiểm tra lại mã tại <a className="underline text-brand-700" href="/verify">trang xác thực</a>.</p>
      </div>
    );
  }

  return (
    <div className="py-8 print:py-0 flex flex-col items-center gap-6 bg-neutral-100 print:bg-white min-h-screen">
      <style>{`@media print { @page { size: A4 landscape; margin: 0 } header, footer, .no-print { display: none !important } }`}</style>
      <p className="no-print text-sm text-ink-soft m-0">
        Dùng chức năng in của trình duyệt (⌘P / Ctrl+P) — chọn khổ ngang, bỏ lề để lưu PDF hoặc in.
      </p>

      <div className="bg-white shadow-lg print:shadow-none w-[1050px] max-w-full aspect-[297/210] relative font-serif text-ink">
        {/* khung viền kép thương hiệu */}
        <div className="absolute inset-4 border-4 border-brand-900" />
        <div className="absolute inset-6 border border-lime" />
        <div className="absolute inset-0 flex flex-col items-center px-24 py-14 text-center">
          <img src="/logo-set.png" alt="Trung tâm SET" className="h-16 mb-3" />
          <p className="text-[13px] tracking-wide m-0">VIỆN NGHIÊN CỨU CÔNG NGHỆ HỖ TRỢ NÔNG NGHIỆP</p>
          <p className="text-[15px] font-bold tracking-wide m-0">TRUNG TÂM ĐÀO TẠO VÀ CÔNG NGHỆ HỖ TRỢ ĐỔI MỚI SÁNG TẠO</p>
          <h1 className="text-[42px] leading-tight text-brand-900 mt-6 mb-1 font-bold">GIẤY CHỨNG NHẬN</h1>
          <p className="text-[15px] italic text-ink-soft mt-0 mb-5">Certificate of Completion</p>
          <p className="text-[16px] m-0">Chứng nhận Ông/Bà</p>
          <p className="text-[32px] font-bold text-brand-700 my-2">{cert.learner_name}</p>
          <p className="text-[16px] m-0">đã hoàn thành chương trình đào tạo</p>
          <p className="text-[20px] font-bold my-2 max-w-3xl">{cert.course_title}</p>
          <p className="text-[14px] text-ink-soft m-0">
            Thời lượng: {cert.duration_hours} giờ · Hoàn thành ngày {formatDate(cert.completed_on)} · Kết quả: {cert.result || 'Hoàn thành'}
          </p>
          <div className="mt-auto w-full flex items-end justify-between text-left">
            <div className="text-[12px] text-ink-soft leading-relaxed">
              <p className="m-0">Số: <b className="tabular-nums">{cert.cert_no}</b> · Cấp ngày {formatDate(cert.issued_on)}</p>
              <p className="m-0">Chứng nhận điện tử — xác thực tại <b>set.edu.vn/verify</b></p>
            </div>
            <div className="text-center text-[13px]">
              <p className="font-bold m-0">TRUNG TÂM SET</p>
              <p className="italic text-ink-soft m-0">(Cấp tự động từ hệ thống LMS,</p>
              <p className="italic text-ink-soft m-0 mb-1">giá trị xác thực theo mã số trực tuyến)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

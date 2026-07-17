import './globals.css';
import Link from 'next/link';
import { Lora, Be_Vietnam_Pro } from 'next/font/google';
import { LogoWordmark } from '../components/Logo';

const lora = Lora({ subsets: ['vietnamese', 'latin'], variable: '--font-lora', weight: ['400', '600', '700'] });
const bvp = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], variable: '--font-bvp', weight: ['400', '500', '600', '700'] });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://set.edu.vn'),
  title: {
    default: 'SET — Trung tâm Đào tạo và Công nghệ Hỗ trợ Đổi mới sáng tạo',
    template: '%s | SET.edu.vn',
  },
  description:
    'Trung tâm Đào tạo và Công nghệ Hỗ trợ Đổi mới sáng tạo (SET) trực thuộc Viện ASTRI: đào tạo đổi mới sáng tạo, năng suất - chất lượng, sở hữu trí tuệ, chuyển đổi số.',
  openGraph: { siteName: 'SET.edu.vn', locale: 'vi_VN', type: 'website' },
};

const NAV = [
  ['/', 'Trang chủ'],
  ['/gioi-thieu', 'Giới thiệu'],
  ['/khoa-hoc', 'Khóa học'],
  ['/tin-tuc', 'Tin tức - Sự kiện'],
  ['/verify', 'Xác thực chứng nhận'],
];

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${lora.variable} ${bvp.variable}`}>
      <body>
        <div className="bg-brand-900 text-[#CFE8B8] text-[12.5px] py-1.5 text-center px-3">
          Đơn vị trực thuộc <b className="text-white font-semibold">Viện Nghiên cứu Công nghệ Hỗ trợ Nông nghiệp (ASTRI)</b> · GCN hoạt động KH&CN số A-1984, Bộ KH&CN
        </div>
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-line">
          <div className="wrap flex items-center gap-7 h-[66px]">
            <Link href="/" className="flex items-center gap-3" aria-label="SET.edu.vn — Trang chủ">
              <LogoWordmark className="h-9 w-auto" />
              <span className="hidden sm:block leading-tight">
                <span className="font-extrabold">SET.edu.vn</span>
                <small className="block text-[10.5px] text-ink-soft font-normal">Đào tạo & Công nghệ Hỗ trợ Đổi mới sáng tạo</small>
              </span>
            </Link>
            <div className="hidden lg:flex gap-6 ml-auto text-[14.5px] font-medium">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-brand-700">{label}</Link>
              ))}
            </div>
            <a href="https://lms.set.edu.vn" className="btn-green !px-4 !py-2 text-[13.5px] ml-auto lg:ml-0">Đăng nhập LMS</a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-brand-900 text-[#CFE0D3] text-[13.5px] mt-16">
          <div className="wrap grid gap-8 md:grid-cols-4 py-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <LogoWordmark variant="white" className="h-9 w-auto" />
                <h4 className="text-white font-sans font-bold uppercase text-sm tracking-wide">Trung tâm SET</h4>
              </div>
              <p className="mb-2">Trung tâm Đào tạo và Công nghệ Hỗ trợ Đổi mới sáng tạo<br /><em>Support Education and Technology Center</em></p>
              <p className="text-[#8FCB6B]">Trực thuộc Viện ASTRI · Thôn Du Nội, xã Mai Lâm, huyện Đông Anh, Hà Nội<br />info@set.edu.vn</p>
            </div>
            <div>
              <h4 className="text-white font-sans font-bold uppercase text-sm tracking-wide mb-3">Đào tạo</h4>
              {[['/khoa-hoc', 'Tất cả khóa học'], ['/verify', 'Xác thực chứng nhận'], ['https://lms.set.edu.vn', 'Cổng người học (LMS)']].map(([h, l]) => (
                <Link key={h} href={h} className="block mb-2 text-[#A9D97E] hover:text-white">{l}</Link>
              ))}
            </div>
            <div>
              <h4 className="text-white font-sans font-bold uppercase text-sm tracking-wide mb-3">Tổ chức</h4>
              {[['/gioi-thieu', 'Về SET'], ['/gioi-thieu#phap-ly', 'Cơ sở pháp lý & công bố'], ['/gioi-thieu#phi-loi-nhuan', 'Mô hình phi lợi nhuận']].map(([h, l]) => (
                <Link key={h} href={h} className="block mb-2 text-[#A9D97E] hover:text-white">{l}</Link>
              ))}
            </div>
            <div>
              <h4 className="text-white font-sans font-bold uppercase text-sm tracking-wide mb-3">Pháp lý & chính sách</h4>
              {[['/gioi-thieu#phap-ly', 'QĐ thành lập 07/2026/QĐ-ASTRI'], ['/gioi-thieu#phap-ly', 'GCN hoạt động KH&CN A-1984'], ['/chinh-sach-bao-mat', 'Chính sách bảo mật & dữ liệu cá nhân']].map(([h, l], i) => (
                <Link key={i} href={h} className="block mb-2 text-[#A9D97E] hover:text-white">{l}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-white/15">
            <div className="wrap py-4 text-xs text-[#8FCB6B] flex flex-wrap justify-between gap-3">
              <span>© 2026 Trung tâm SET — Viện ASTRI. Hoạt động không vì mục tiêu lợi nhuận theo Điều lệ (QĐ 08/2026/QĐ-ASTRI).</span>
              <span>set.edu.vn</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

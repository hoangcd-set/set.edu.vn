import './globals.css';
import { Lora, Be_Vietnam_Pro } from 'next/font/google';
import Header from '../components/Header';

const lora = Lora({ subsets: ['vietnamese', 'latin'], variable: '--font-lora', weight: ['400', '600', '700'] });
const bvp = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], variable: '--font-bvp', weight: ['400', '500', '600', '700'] });

export const metadata = {
  metadataBase: new URL('https://lms.set.edu.vn'),
  title: { default: 'Cổng học tập SET — lms.set.edu.vn', template: '%s | LMS SET' },
  description: 'Nền tảng học tập trực tuyến của Trung tâm Đào tạo và Công nghệ Hỗ trợ Đổi mới sáng tạo (SET).',
  robots: { index: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${lora.variable} ${bvp.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="bg-brand-900 text-[#A9D97E] text-xs">
          <div className="wrap py-4 flex flex-wrap justify-between gap-2">
            <span>© 2026 Trung tâm SET — Viện ASTRI · Cổng học tập trực tuyến</span>
            <span><a href="https://set.edu.vn" className="hover:text-white">set.edu.vn</a> · <a href="https://set.edu.vn/verify" className="hover:text-white">Xác thực chứng nhận</a> · <a href="https://set.edu.vn/chinh-sach-bao-mat" className="hover:text-white">Chính sách bảo mật</a></span>
          </div>
        </footer>
      </body>
    </html>
  );
}

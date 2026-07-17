import Link from 'next/link';
import { supabase } from '../lib/supabase';
import CourseCard from '../components/CourseCard';
import { formatDate } from '../lib/supabase';

export const revalidate = 300;

const GROUP_META = {
  'doi-moi-sang-tao': 'ISO 56000, Design Thinking',
  'khoi-nghiep-sang-tao': 'Ươm tạo, gọi vốn',
  'nang-suat-chat-luong': 'ISO 9001, 5S, Lean',
  'so-huu-tri-tue': 'Bảo hộ, thương mại hóa',
  'chuyen-doi-so-stem': 'AI, dữ liệu, giáo viên',
};

export default async function Home() {
  const [{ data: groups }, { data: courses }, { data: posts }] = await Promise.all([
    supabase.from('course_groups').select('*').order('sort_order'),
    supabase.from('courses').select('*').eq('is_published', true).limit(6),
    supabase.from('posts').select('slug,category,title,published_at').eq('is_published', true)
      .order('published_at', { ascending: false }).limit(4),
  ]);

  return (
    <>
      {/* HERO */}
      <header className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 text-white relative overflow-hidden">
        <div className="wrap grid lg:grid-cols-[1.15fr,.85fr] gap-12 items-center py-16 lg:py-20 relative">
          <div>
            <span className="eyebrow !text-[#A9D97E]">Trung tâm đổi mới sáng tạo · Nghị định 268/2025/NĐ-CP</span>
            <h1 className="text-4xl lg:text-5xl font-bold mt-3 mb-4 leading-tight">Học đổi mới sáng tạo.<br />Làm ra kết quả thật.</h1>
            <p className="max-w-[56ch] text-[#DCEDE1] text-lg mb-7">
              SET đào tạo và đồng hành cùng cá nhân, doanh nghiệp về <strong>đổi mới sáng tạo, năng suất - chất lượng,
              sở hữu trí tuệ và chuyển đổi số</strong> — với đội ngũ chuyên gia của Viện ASTRI và mạng lưới viện, trường, doanh nghiệp cả nước.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/khoa-hoc" className="btn-accent">Khám phá khóa học</Link>
              <Link href="/gioi-thieu" className="btn border-[1.5px] border-white/60 text-white">Nhận tư vấn doanh nghiệp</Link>
            </div>
            <p className="mt-6 text-[13px] text-[#A9D97E]">✓ Chứng nhận hoàn thành có mã QR, xác thực trực tuyến tại set.edu.vn/verify</p>
          </div>
          <div className="grid gap-3">
            {(courses || []).slice(0, 4).map((c) => (
              <Link key={c.id} href={`/khoa-hoc/${c.slug}`} className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 backdrop-blur hover:bg-white/15">
                <b className="text-[14.5px] block">{c.title}</b>
                <span className="text-[12.5px] text-[#BFE3C4]">{c.duration_hours} giờ · {c.code}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* TRUST */}
      <div className="bg-white border-b border-line">
        <div className="wrap flex flex-wrap items-center justify-center gap-8 py-4 text-[13.5px] font-semibold text-ink-soft">
          <span className="text-xs uppercase tracking-widest font-normal">Được bảo trợ & đồng hành bởi</span>
          <span>Liên hiệp Hội Việt Nam</span><span>Viện ASTRI</span><span>Mạng lưới chuyên gia SHTT</span><span>Doanh nghiệp đối tác</span>
        </div>
      </div>

      {/* GROUPS */}
      <section className="wrap py-14">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <span className="eyebrow">Chương trình đào tạo</span>
            <h2 className="text-3xl mt-1">Năm trụ cột năng lực đổi mới sáng tạo</h2>
          </div>
          <Link href="/khoa-hoc" className="font-semibold text-brand-700 hover:underline">Xem tất cả khóa học →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(groups || []).map((g) => (
            <Link key={g.id} href={`/khoa-hoc#${g.slug}`} className="card p-5 hover:border-brand-700 hover:shadow-md transition">
              <b className="block mb-1 text-[15px]">{g.name}</b>
              <span className="text-[13px] text-ink-soft">{GROUP_META[g.slug] || ''}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="wrap pb-14">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <span className="eyebrow">Khai giảng gần nhất</span>
            <h2 className="text-3xl mt-1">Khóa học nổi bật</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {(courses || []).slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-brand-900 text-white py-12">
        <div className="wrap grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['12', 'Chương trình đào tạo đợt 1'], ['5', 'Trụ cột năng lực'], ['60+', 'Chuyên gia trong mạng lưới'], ['2026', 'Năm thành lập theo QĐ 07/2026/QĐ-ASTRI']].map(([n, l]) => (
            <div key={l}>
              <b className="font-serif text-4xl block text-[#CFE8B8] tabular-nums">{n}</b>
              <span className="text-[#A9D97E] text-sm">{l}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[#8FCB6B] text-xs mt-6 px-4">Số liệu cập nhật theo chỉ tiêu tại Quyết định 17/2026/QĐ-ASTRI — minh chứng công nhận trung tâm ĐMST (Điều 29 NĐ 268/2025/NĐ-CP).</p>
      </section>

      {/* NEWS */}
      <section className="wrap py-14">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <span className="eyebrow">Tin tức</span>
            <h2 className="text-3xl mt-1">Hoạt động mới nhất</h2>
          </div>
          <Link href="/tin-tuc" className="font-semibold text-brand-700 hover:underline">Tất cả tin →</Link>
        </div>
        {posts?.length ? (
          <div className="grid gap-4">
            {posts.map((p) => (
              <Link key={p.slug} href={`/tin-tuc/${p.slug}`} className="card px-5 py-4 flex items-center gap-4 hover:border-brand-700">
                <span className="text-xs text-ink-soft w-24 shrink-0 tabular-nums">{formatDate(p.published_at)}</span>
                <span className="font-semibold">{p.title}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">Chuyên mục tin tức sẽ cập nhật ngay khi Trung tâm khai trương hoạt động — theo lịch xuất bản 2-3 tin/tuần.</p>
        )}
      </section>
    </>
  );
}

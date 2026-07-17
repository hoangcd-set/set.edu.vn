import Link from 'next/link';
import { supabase, formatDate } from '../../lib/supabase';

export const revalidate = 120;
export const metadata = { title: 'Tin tức - Sự kiện', description: 'Tin hoạt động, sự kiện, bản tin đổi mới sáng tạo của Trung tâm SET.' };

const CATS = {
  'hoat-dong': 'Tin hoạt động', 'su-kien': 'Sự kiện', 'ban-tin': 'Bản tin ĐMST',
  'cau-chuyen': 'Câu chuyện học viên', 'tuyen-sinh': 'Tuyển sinh',
};

export default async function NewsPage({ searchParams }) {
  const { cat } = await searchParams;
  let q = supabase.from('posts').select('slug,category,title,excerpt,published_at,event_starts_at,event_location')
    .eq('is_published', true).order('published_at', { ascending: false }).limit(30);
  if (cat && CATS[cat]) q = q.eq('category', cat);
  const { data: posts } = await q;

  return (
    <div className="wrap py-12">
      <span className="eyebrow">Tin tức - Sự kiện</span>
      <h1 className="text-4xl mt-1 mb-6">Hoạt động của Trung tâm SET</h1>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/tin-tuc" className={`px-3 py-1.5 rounded-full text-sm border ${!cat ? 'bg-brand-700 text-white border-brand-700' : 'border-line bg-white'}`}>Tất cả</Link>
        {Object.entries(CATS).map(([k, v]) => (
          <Link key={k} href={`/tin-tuc?cat=${k}`} className={`px-3 py-1.5 rounded-full text-sm border ${cat === k ? 'bg-brand-700 text-white border-brand-700' : 'border-line bg-white'}`}>{v}</Link>
        ))}
      </div>
      {posts?.length ? (
        <div className="grid gap-4">
          {posts.map((p) => (
            <Link key={p.slug} href={`/tin-tuc/${p.slug}`} className="card px-5 py-4 hover:border-brand-700">
              <div className="flex flex-wrap gap-3 text-xs text-ink-soft mb-1">
                <span className="uppercase font-bold tracking-wide text-lime-dark">{CATS[p.category]}</span>
                <span className="tabular-nums">{formatDate(p.published_at)}</span>
                {p.event_starts_at && <span>⚑ Diễn ra: {formatDate(p.event_starts_at)} · {p.event_location}</span>}
              </div>
              <h2 className="text-lg font-sans font-semibold m-0">{p.title}</h2>
              {p.excerpt && <p className="text-sm text-ink-soft mt-1 m-0">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-ink-soft">Chưa có bài viết trong chuyên mục này. Nội dung sẽ được cập nhật theo lịch xuất bản định kỳ của Trung tâm.</p>
      )}
    </div>
  );
}

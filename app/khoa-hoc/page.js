import { supabase } from '../../lib/supabase';
import CourseCard from '../../components/CourseCard';

export const revalidate = 300;
export const metadata = {
  title: 'Khóa học',
  description: 'Danh mục 12 chương trình đào tạo đổi mới sáng tạo, năng suất - chất lượng, sở hữu trí tuệ, chuyển đổi số của Trung tâm SET.',
};

export default async function CoursesPage() {
  const [{ data: groups }, { data: courses }] = await Promise.all([
    supabase.from('course_groups').select('*').order('sort_order'),
    supabase.from('courses').select('*').eq('is_published', true).order('code'),
  ]);

  return (
    <div className="wrap py-12">
      <span className="eyebrow">Chương trình đào tạo</span>
      <h1 className="text-4xl mt-1 mb-3">Danh mục khóa học</h1>
      <p className="text-ink-soft max-w-[70ch]">
        12 chương trình đợt 1 ban hành theo Quyết định 16/2026/QĐ-ASTRI, được Hội đồng khoa học và đào tạo thẩm định.
        Hoàn thành khóa học, học viên được cấp Giấy chứng nhận có mã QR xác thực trực tuyến.
      </p>
      {(groups || []).map((g) => {
        const list = (courses || []).filter((c) => c.group_id === g.id);
        if (!list.length) return null;
        return (
          <section key={g.id} id={g.slug} className="mt-12 scroll-mt-24">
            <h2 className="text-2xl mb-5 pb-2 border-b border-line">{g.name}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

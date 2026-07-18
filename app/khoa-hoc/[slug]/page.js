import { notFound } from 'next/navigation';
import { supabase, FORMAT_LABEL, formatVnd, formatDate } from '../../../lib/supabase';
import RegisterForm from '../../../components/RegisterForm';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data } = await supabase.from('courses').select('title,summary').eq('slug', slug).single();
  return { title: data?.title || 'Khóa học', description: data?.summary || undefined };
}

export default async function CourseDetail({ params }) {
  const { slug } = await params;
  const { data: course } = await supabase.from('courses').select('*').eq('slug', slug).eq('is_published', true).single();
  if (!course) notFound();

  const [{ data: sessions }, { data: group }] = await Promise.all([
    supabase.from('course_sessions').select('*').eq('course_id', course.id).eq('status', 'open').order('starts_on'),
    supabase.from('course_groups').select('name').eq('id', course.group_id).single(),
  ]);

  const outcomes = Array.isArray(course.outcomes) ? course.outcomes : [];
  const syllabus = Array.isArray(course.syllabus) ? course.syllabus : [];
  const faq = Array.isArray(course.faq) ? course.faq : [];

  return (
    <>
      <header className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-12">
        <div className="wrap">
          <span className="eyebrow !text-[#A9D97E]">{group?.name} · {course.code}</span>
          <h1 className="text-3xl lg:text-4xl mt-2 mb-4 max-w-[30ch]">{course.title}</h1>
          <div className="flex flex-wrap gap-5 text-[14px] text-[#DCEDE1]">
            <span>◷ {course.duration_hours} giờ</span>
            <span>◉ {FORMAT_LABEL[course.format]}</span>
            <span>💳 {formatVnd(course.price_vnd)}</span>
            {sessions?.[0] && <span>⚑ Khai giảng gần nhất: {formatDate(sessions[0].starts_on)}</span>}
          </div>
        </div>
      </header>

      <div className="wrap grid lg:grid-cols-[1.5fr,1fr] gap-10 py-12">
        <div className="space-y-10">
          {course.summary && <p className="text-lg text-ink-soft">{course.summary}</p>}

          {outcomes.length > 0 && (
            <section>
              <h2 className="text-2xl mb-4">Chuẩn đầu ra</h2>
              <ul className="grid gap-2 list-none p-0">
                {outcomes.map((o, i) => (
                  <li key={i} className="flex gap-2"><span className="text-lime-dark font-bold">✓</span>{o}</li>
                ))}
              </ul>
            </section>
          )}

          {course.audience && (
            <section>
              <h2 className="text-2xl mb-3">Đối tượng</h2>
              <p className="text-ink-soft">{course.audience}</p>
            </section>
          )}

          {syllabus.length > 0 && (
            <section>
              <h2 className="text-2xl mb-4">Nội dung chương trình</h2>
              <ol className="grid gap-3 list-none p-0">
                {syllabus.map((s, i) => (
                  <li key={i} className="card p-4">
                    <b>Buổi {i + 1}: {s.title}</b>
                    {s.detail && <p className="text-sm text-ink-soft mt-1 m-0">{s.detail}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section>
            <h2 className="text-2xl mb-3">Chứng nhận</h2>
            <p className="text-ink-soft">
              Học viên hoàn thành chương trình (chuyên cần ≥ 80% và đạt bài đánh giá) được cấp <b>Giấy chứng nhận hoàn thành</b> của
              Trung tâm SET - Viện ASTRI theo Quy chế đào tạo (QĐ 12/2026/QĐ-ASTRI). Mỗi chứng nhận có mã định danh
              SET-NĂM-SỐ và mã QR, xác thực công khai tại <a href="/verify" className="text-brand-700 underline">set.edu.vn/verify</a>.
            </p>
          </section>

          {faq.length > 0 && (
            <section>
              <h2 className="text-2xl mb-4">Câu hỏi thường gặp</h2>
              <div className="grid gap-3">
                {faq.map((f, i) => (
                  <details key={i} className="card p-4">
                    <summary className="font-semibold cursor-pointer">{f.q}</summary>
                    <p className="text-sm text-ink-soft mt-2 m-0">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <h2 className="text-xl mb-4">Đăng ký / nhận tư vấn</h2>
          <RegisterForm courseId={course.id} sessions={sessions || []} />
          <div className="card p-5 mt-5 text-sm">
            <p className="font-bold text-brand-900 m-0 mb-2">📚 Học liệu trực tuyến kèm khóa học</p>
            <p className="text-ink-soft m-0">
              100% buổi học có video bài giảng, bài đọc chuyên sâu và trắc nghiệm trên nền tảng{' '}
              <a className="text-brand-700 underline font-semibold" href="https://lms.set.edu.vn">lms.set.edu.vn</a>.
              Hoàn thành khóa học được cấp chứng nhận điện tử, xác thực tại <a className="text-brand-700 underline" href="/verify">set.edu.vn/verify</a>.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

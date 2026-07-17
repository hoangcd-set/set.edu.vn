import Link from 'next/link';
import { FORMAT_LABEL, formatVnd, formatDate } from '../lib/supabase';

export default function CourseCard({ course, session }) {
  return (
    <article className="card overflow-hidden flex flex-col transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="h-24 bg-gradient-to-br from-brand-100 to-white border-b border-line flex items-end p-4 relative">
        <span className="absolute top-3 left-4 bg-brand-900 text-white text-[11px] font-bold tracking-wider uppercase px-2 py-1 rounded-md">{course.code}</span>
        <h3 className="text-lg leading-snug">{course.title}</h3>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-3 text-[12.5px] text-ink-soft">
          <span>◷ {course.duration_hours} giờ</span>
          <span>◉ {FORMAT_LABEL[course.format] || course.format}</span>
          {session && <span>⚑ {formatDate(session.starts_on)}</span>}
        </div>
        {course.summary && <p className="text-sm text-ink-soft m-0">{course.summary}</p>}
        <div className="mt-auto pt-3 border-t border-dashed border-line flex justify-between items-center">
          <span className="font-bold text-brand-700 tabular-nums">{formatVnd(course.price_vnd)}</span>
          <Link href={`/khoa-hoc/${course.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">Chi tiết →</Link>
        </div>
      </div>
    </article>
  );
}

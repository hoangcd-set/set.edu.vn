import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { supabase, formatDate } from '../../../lib/supabase';

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data } = await supabase.from('posts').select('title,excerpt').eq('slug', slug).single();
  return { title: data?.title || 'Bài viết', description: data?.excerpt || undefined };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).eq('is_published', true).single();
  if (!post) notFound();
  const html = post.body_md ? marked.parse(post.body_md) : '';

  return (
    <article className="wrap py-12 max-w-3xl">
      <p className="text-xs text-ink-soft mb-2 tabular-nums">{formatDate(post.published_at)} {post.author && `· ${post.author}`}</p>
      <h1 className="text-4xl mb-4">{post.title}</h1>
      {post.excerpt && <p className="text-lg text-ink-soft mb-6">{post.excerpt}</p>}
      {post.event_starts_at && (
        <div className="card p-4 mb-6 bg-brand-100">
          <b>Thời gian:</b> {new Date(post.event_starts_at).toLocaleString('vi-VN')}
          {post.event_location && <> · <b>Địa điểm:</b> {post.event_location}</>}
        </div>
      )}
      <div className="prose-set space-y-4 leading-relaxed [&_h2]:text-2xl [&_h2]:mt-8 [&_h3]:text-xl [&_a]:text-brand-700 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
        dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

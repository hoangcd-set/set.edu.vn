import { supabase } from '../lib/supabase';

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://set.edu.vn';
  const [{ data: courses }, { data: posts }] = await Promise.all([
    supabase.from('courses').select('slug,updated_at').eq('is_published', true),
    supabase.from('posts').select('slug,published_at').eq('is_published', true),
  ]);
  return [
    { url: base, priority: 1 },
    { url: `${base}/khoa-hoc`, priority: 0.9 },
    { url: `${base}/tin-tuc`, priority: 0.8 },
    { url: `${base}/gioi-thieu`, priority: 0.7 },
    { url: `${base}/verify`, priority: 0.6 },
    { url: `${base}/chinh-sach-bao-mat`, priority: 0.3 },
    ...(courses || []).map((c) => ({ url: `${base}/khoa-hoc/${c.slug}`, lastModified: c.updated_at, priority: 0.8 })),
    ...(posts || []).map((p) => ({ url: `${base}/tin-tuc/${p.slug}`, lastModified: p.published_at, priority: 0.6 })),
  ];
}

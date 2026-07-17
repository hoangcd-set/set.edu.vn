import { createClient } from '@supabase/supabase-js';

export const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cykmszpgfnznjwtghwtt.supabase.co';
export const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0Z-BkHLENWptNVN0erWxcA_RhffHL15';

let _browser;
/** Client trình duyệt (giữ phiên đăng nhập của người học) */
export function supabaseBrowser() {
  if (!_browser) _browser = createClient(SUPA_URL, SUPA_ANON);
  return _browser;
}

/** Client đặc quyền — CHỈ dùng trong API routes */
export function supabaseAdmin() {
  return createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

/** Xác thực Bearer token của người dùng, trả về user hoặc null */
export async function userFromRequest(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const sb = createClient(SUPA_URL, SUPA_ANON, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  return error ? null : data?.user || null;
}

const ADMINS = (process.env.ADMIN_EMAILS || 'hoangcd@set.edu.vn,info@set.edu.vn')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
export function isAdmin(user) { return !!user && ADMINS.includes((user.email || '').toLowerCase()); }

/** Nhúng video: YouTube / Vimeo / mp4 trực tiếp */
export function videoEmbed(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: 'video', src: url };
}

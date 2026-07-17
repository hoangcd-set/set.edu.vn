import { createClient } from '@supabase/supabase-js';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cykmszpgfnznjwtghwtt.supabase.co';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0Z-BkHLENWptNVN0erWxcA_RhffHL15';

const ADMINS = (process.env.ADMIN_EMAILS || 'hoangcd@set.edu.vn,info@set.edu.vn')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

/** Trả về user nếu Bearer token hợp lệ và email nằm trong danh sách quản trị; ngược lại null */
export async function requireAdmin(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const sb = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  const user = data?.user;
  if (error || !user) return null;
  return ADMINS.includes((user.email || '').toLowerCase()) ? user : null;
}

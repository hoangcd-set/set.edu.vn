import { createClient } from '@supabase/supabase-js';

// URL và publishable key là giá trị CÔNG KHAI (gửi xuống trình duyệt),
// nhúng fallback để build không phụ thuộc biến môi trường.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cykmszpgfnznjwtghwtt.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0Z-BkHLENWptNVN0erWxcA_RhffHL15';

// Client chỉ đọc nội dung công khai (chạy được cả client/server)
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

// Client đặc quyền — CHỈ dùng trong API routes / server components
export function supabaseAdmin() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export const FORMAT_LABEL = { online: 'Trực tuyến', offline: 'Trực tiếp', blended: 'Kết hợp' };

export function formatVnd(n) {
  if (n == null) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

export function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

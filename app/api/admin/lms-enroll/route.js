import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAdmin } from '../../../../lib/adminAuth';

// Cấp tài khoản LMS + ghi danh khóa học từ một bản ghi đăng ký trên website.
// Trả về mật khẩu tạm (chỉ hiển thị một lần cho quản trị viên gửi học viên).
export async function POST(req) {
  const adminUser = await requireAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Chưa đăng nhập hoặc không có quyền' }, { status: 401 });

  const { registration_id } = await req.json().catch(() => ({}));
  if (!registration_id) return NextResponse.json({ error: 'Thiếu registration_id' }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: reg } = await admin.from('registrations').select('*').eq('id', registration_id).single();
  if (!reg) return NextResponse.json({ error: 'Không tìm thấy bản đăng ký' }, { status: 404 });
  if (!reg.course_id) return NextResponse.json({ error: 'Bản đăng ký không gắn khóa học cụ thể' }, { status: 400 });

  const email = reg.email.trim().toLowerCase();

  // tìm hoặc tạo tài khoản học viên
  let userId = null, tempPassword = null, created = false;
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users?.find((u) => (u.email || '').toLowerCase() === email);
  if (existing) {
    userId = existing.id;
  } else {
    tempPassword = 'Set' + Math.random().toString(36).slice(2, 8) + '!' + Math.floor(10 + Math.random() * 89);
    const { data: nu, error: ce } = await admin.auth.admin.createUser({
      email, password: tempPassword, email_confirm: true,
      user_metadata: { full_name: reg.full_name },
    });
    if (ce) return NextResponse.json({ error: 'Không tạo được tài khoản: ' + ce.message }, { status: 500 });
    userId = nu.user.id; created = true;
  }

  // ghi danh (bỏ qua nếu đã có)
  const { error: ee } = await admin.from('lms_enrollments')
    .upsert({ user_id: userId, course_id: reg.course_id }, { onConflict: 'user_id,course_id' });
  if (ee) return NextResponse.json({ error: 'Không ghi danh được: ' + ee.message }, { status: 500 });

  await admin.from('registrations').update({ status: 'confirmed' }).eq('id', registration_id);

  return NextResponse.json({
    ok: true, created, email,
    temp_password: tempPassword, // null nếu tài khoản đã tồn tại
    lms_url: 'https://lms.set.edu.vn',
  });
}

export const metadata = { title: 'Chính sách bảo mật & dữ liệu cá nhân' };

export default function PrivacyPage() {
  return (
    <div className="wrap py-12 max-w-3xl space-y-6">
      <h1 className="text-4xl">Chính sách bảo mật & dữ liệu cá nhân</h1>
      <p className="text-ink-soft">Ban hành theo Quy chế quản lý hệ thống công nghệ thông tin, tên miền set.edu.vn, tài khoản định danh và bảo vệ dữ liệu cá nhân (Quyết định 14/2026/QĐ-ASTRI). Áp dụng cho mọi dịch vụ trên tên miền set.edu.vn.</p>
      {[
        ['1. Dữ liệu thu thập', 'Họ tên, email, số điện thoại, đơn vị công tác khi bạn đăng ký khóa học, sự kiện hoặc nhận bản tin; dữ liệu học tập (điểm danh, kết quả đánh giá) khi bạn là người học; nhật ký kỹ thuật cơ bản để bảo đảm an toàn hệ thống.'],
        ['2. Mục đích sử dụng', 'Tổ chức đào tạo, cấp và xác thực chứng nhận, liên hệ tư vấn theo yêu cầu của bạn, gửi bản tin (nếu đăng ký) và thực hiện nghĩa vụ báo cáo theo quy định pháp luật. Trung tâm không sử dụng dữ liệu ngoài các mục đích đã công bố.'],
        ['3. Chia sẻ dữ liệu', 'Không chuyển giao dữ liệu cá nhân cho bên thứ ba khi chưa có sự đồng ý của bạn, trừ trường hợp pháp luật quy định. Dữ liệu được lưu trữ trên hạ tầng Supabase và Cloudflare với các biện pháp kiểm soát truy cập.'],
        ['4. Quyền của bạn', 'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình; rút lại sự đồng ý nhận bản tin bất cứ lúc nào. Đầu mối tiếp nhận: info@set.edu.vn.'],
        ['5. Thời hạn lưu trữ', 'Hồ sơ người học và sổ cấp phát chứng nhận lưu tối thiểu 10 năm theo Quy chế đào tạo; dữ liệu đăng ký tư vấn không phát sinh giao dịch được xóa sau 24 tháng.'],
        ['6. Sự cố', 'Khi xảy ra sự cố lộ lọt dữ liệu, Trung tâm thực hiện các biện pháp khắc phục và thông báo theo quy định của pháp luật về bảo vệ dữ liệu cá nhân.'],
      ].map(([h, t]) => (
        <section key={h}>
          <h2 className="text-xl mb-2">{h}</h2>
          <p className="text-ink-soft m-0">{t}</p>
        </section>
      ))}
    </div>
  );
}

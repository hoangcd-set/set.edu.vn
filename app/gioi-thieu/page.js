import RegisterForm from '../../components/RegisterForm';

export const metadata = {
  title: 'Giới thiệu',
  description: 'Trung tâm Đào tạo và Công nghệ Hỗ trợ Đổi mới sáng tạo (SET) — Support Education and Technology Center, trực thuộc Viện ASTRI.',
};

const LEGAL = [
  ['Quyết định thành lập', 'Số 07/2026/QĐ-ASTRI ngày 07/5/2026 của Hội đồng quản lý Viện ASTRI'],
  ['Điều lệ tổ chức và hoạt động', 'Phê duyệt tại Quyết định số 08/2026/QĐ-ASTRI ngày 07/5/2026 (06 chương, 27 điều)'],
  ['Cơ quan chủ quản', 'Viện Nghiên cứu Công nghệ Hỗ trợ Nông nghiệp (ASTRI) — thành lập theo QĐ 934/QĐ-LHHVN ngày 12/9/2018 của Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam'],
  ['Đăng ký hoạt động KH&CN', 'Giấy chứng nhận số A-1984 do Bộ Khoa học và Công nghệ cấp (đăng ký lần đầu 15/10/2018, cấp thay đổi 20/9/2024) — bao gồm chức năng đào tạo bồi dưỡng, tập huấn'],
  ['Khung pháp luật hoạt động', 'Luật Khoa học, công nghệ và đổi mới sáng tạo số 93/2025/QH15; Nghị định 268/2025/NĐ-CP về trung tâm đổi mới sáng tạo'],
];

export default function AboutPage() {
  return (
    <div className="wrap py-12 max-w-4xl">
      <span className="eyebrow">Giới thiệu</span>
      <h1 className="text-4xl mt-1 mb-4">Trung tâm Đào tạo và Công nghệ Hỗ trợ Đổi mới sáng tạo</h1>
      <p className="text-lg text-ink-soft">
        <b className="text-ink">SET</b> (Support - Education - Technology) là đơn vị trực thuộc Viện Nghiên cứu Công nghệ
        Hỗ trợ Nông nghiệp (ASTRI), hoạt động theo mô hình trung tâm đổi mới sáng tạo quy định tại Điều 29 Nghị định
        268/2025/NĐ-CP. Chức năng chính của Trung tâm là <b className="text-ink">đào tạo, bồi dưỡng, tập huấn</b> nguồn nhân lực về đổi mới
        sáng tạo, khởi nghiệp sáng tạo, năng suất - chất lượng, sở hữu trí tuệ và chuyển đổi số; đồng thời cung cấp đầy đủ
        dịch vụ hỗ trợ đổi mới sáng tạo cho tổ chức, doanh nghiệp.
      </p>

      <section id="phi-loi-nhuan" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl mb-3">Mô hình không vì lợi nhuận</h2>
        <p className="text-ink-soft">
          Theo Điều 3 Điều lệ, Trung tâm hoạt động <b className="text-ink">không vì mục tiêu lợi nhuận</b>: toàn bộ chênh lệch thu - chi
          được tái đầu tư cho phát triển chương trình, học liệu, hạ tầng công nghệ giáo dục, học bổng và hỗ trợ người học;
          không chia lợi nhuận cho tổ chức, cá nhân. Đây là cơ sở để Trung tâm tham gia các chương trình hỗ trợ giáo dục
          của các tổ chức công nghệ toàn cầu (Google for Education, GitHub Education, Anthropic - Claude for Education, OpenAI).
        </p>
      </section>

      <section id="phap-ly" className="mt-10 scroll-mt-24">
        <h2 className="text-2xl mb-4">Cơ sở pháp lý & công bố</h2>
        <div className="card divide-y divide-line">
          {LEGAL.map(([k, v]) => (
            <div key={k} className="grid sm:grid-cols-[220px,1fr] gap-1 sm:gap-6 p-4">
              <b className="text-sm">{k}</b>
              <span className="text-sm text-ink-soft">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-soft mt-2">Bản chụp các văn bản sẽ được đăng tải tại mục này sau khi hoàn tất thủ tục ban hành chính thức.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl mb-3">Liên hệ & tư vấn doanh nghiệp</h2>
        <p className="text-ink-soft mb-5">
          Doanh nghiệp cần đào tạo nội bộ, tư vấn ISO/năng suất, sở hữu trí tuệ hoặc ươm tạo — để lại thông tin,
          Trung tâm khảo sát nhu cầu miễn phí.
        </p>
        <RegisterForm kind="business" />
      </section>
    </div>
  );
}

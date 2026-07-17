export const metadata = {
  title: 'About SET (English)',
  description: 'Support Education and Technology Center (SET) — training and innovation support center under ASTRI, Vietnam.',
};

export default function EnglishProfile() {
  return (
    <div className="wrap py-12 max-w-3xl space-y-8">
      <header>
        <p className="eyebrow">English profile</p>
        <h1 className="text-4xl mt-1">Support Education and Technology Center (SET)</h1>
        <p className="text-lg text-ink-soft mt-3">
          SET is a <b className="text-ink">non-profit training and innovation support center</b> under the Agricultural Support
          Technology Research Institute (ASTRI), a science and technology organization registered with the Ministry of
          Science and Technology of Vietnam (Certificate No. A-1984).
        </p>
      </header>
      <section>
        <h2 className="text-2xl mb-3">Legal status</h2>
        <ul className="list-disc pl-6 space-y-2 text-ink-soft">
          <li>Established by Decision No. 07/2026/QĐ-ASTRI (May 7, 2026) of the ASTRI Management Council.</li>
          <li>Charter approved by Decision No. 08/2026/QĐ-ASTRI; operating on a <b className="text-ink">not-for-profit basis</b> — all surpluses are reinvested in education.</li>
          <li>Parent institute ASTRI was founded in 2018 under the Vietnam Union of Science and Technology Associations (VUSTA).</li>
          <li>Operating under the Law on Science, Technology and Innovation No. 93/2025/QH15 and Decree No. 268/2025/NĐ-CP on innovation centers.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl mb-3">What we do</h2>
        <p className="text-ink-soft">
          SET delivers training and certification programs in innovation management (ISO 56000), startup entrepreneurship,
          productivity and quality (ISO 9001, 5S/Kaizen, Lean), intellectual property, digital transformation, applied AI and
          STEM teacher education. Learners receive completion certificates with QR codes verifiable at{' '}
          <a href="/verify" className="text-brand-700 underline">set.edu.vn/verify</a>. Staff, instructors and enrolled learners
          are provisioned with institutional <b className="text-ink">@set.edu.vn</b> accounts through our learning management system.
        </p>
      </section>
      <section>
        <h2 className="text-2xl mb-3">Contact</h2>
        <p className="text-ink-soft">
          Du Noi Hamlet, Mai Lam Commune, Dong Anh District, Hanoi, Vietnam<br />
          Email: info@set.edu.vn · Website: https://set.edu.vn
        </p>
      </section>
    </div>
  );
}

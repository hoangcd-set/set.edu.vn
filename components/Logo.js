/**
 * Logo SET chính thức — dùng đúng file thiết kế gốc (đã tách nền, PNG trong suốt):
 * /logo-set.png (bản màu, nền sáng) · /logo-set-white.png (bản trắng, nền đậm).
 * Tỷ lệ gốc ≈ 2,21:1.
 */
export function LogoWordmark({ variant = 'color', className = '' }) {
  const src = variant === 'white' ? '/logo-set-white.png' : '/logo-set.png';
  return (
    <img src={src} alt="Logo SET" className={className}
      width={variant === 'white' ? 825 : 900} height={variant === 'white' ? 370 : 408} />
  );
}

export function LogoEmblem({ className = '' }) {
  return (
    <svg viewBox="0 0 150 150" className={className} role="img" aria-label="Emblem SET">
      <rect x="4" y="4" width="142" height="142" rx="28" fill="#0E6B3D" />
      <path d="M35 96 L75 112 L115 96 L115 74 L75 90 L35 74 Z" fill="#FFFFFF" opacity=".95" />
      <path d="M35 74 L75 90 L115 74" fill="none" stroke="#7AC143" strokeWidth="5" strokeLinejoin="round" />
      <path d="M75 62 C 88 51, 89 33, 76 24 C 62 32, 61 51, 75 62 Z" fill="#7AC143" />
    </svg>
  );
}

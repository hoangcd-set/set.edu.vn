const T = 58;            // độ dày nét chữ
const CX = 654;          // tâm cột accent của chữ T

function Letters({ fill }) {
  const r = 14;
  return (
    <g fill={fill}>
      {/* S — dựng từ 5 thanh vuông bo góc */}
      <rect x="0" y="0" width="210" height={T} rx={r} />
      <rect x="0" y="0" width={T} height="179" rx={r} />
      <rect x="0" y="121" width="210" height={T} rx={r} />
      <rect x="152" y="121" width={T} height="179" rx={r} />
      <rect x="0" y="242" width="210" height={T} rx={r} />
      {/* E */}
      <rect x="262" y="0" width={T} height="300" rx={r} />
      <rect x="262" y="0" width="210" height={T} rx={r} />
      <rect x="262" y="121" width="188" height={T} rx={r} />
      <rect x="262" y="242" width="210" height={T} rx={r} />
      {/* T — thanh ngang; thân chữ là cột accent */}
      <rect x="524" y="0" width="260" height={T} rx={r} />
    </g>
  );
}

function Chevron({ y, dir = 'up', color }) {
  // dir 'up': đỉnh hướng lên; 'down': đỉnh hướng xuống
  const tip = dir === 'up' ? y - 34 : y + 34;
  return (
    <path d={`M ${CX - 40},${y} L ${CX},${tip} L ${CX + 40},${y}`}
      fill="none" stroke={color} strokeWidth="26" strokeLinecap="butt" strokeLinejoin="miter" />
  );
}

/**
 * Logo SET chính thức (theo bộ nhận diện 7/2026):
 * chữ SET vuông kỹ thuật; chữ T mang cột biểu tượng — giọt lá tri thức,
 * chevron hội tụ về thanh ngang và mũi tên vươn lên từ gốc.
 * variant: 'color' (xanh + lá non, nền sáng) | 'white' (trắng, nền đậm)
 */
export function LogoWordmark({ variant = 'color', className = '' }) {
  const main = variant === 'white' ? '#FFFFFF' : '#0E6B3D';
  const accent = variant === 'white' ? '#FFFFFF' : '#7AC143';
  const vein = variant === 'white' ? '#0A4A2A' : '#FFFFFF';
  return (
    <svg viewBox="-10 -250 810 560" className={className} role="img" aria-label="Logo SET">
      <Letters fill={main} />
      {/* giọt lá tri thức */}
      <path d={`M ${CX},-244 C ${CX + 34},-206 ${CX + 38},-168 ${CX},-138 C ${CX - 38},-168 ${CX - 34},-206 ${CX},-244 Z`} fill={accent} />
      <path d={`M ${CX - 10},-152 C ${CX - 4},-176 ${CX + 4},-196 ${CX + 14},-212`} fill="none" stroke={vein} strokeWidth="9" strokeLinecap="round" />
      {/* chevron hội tụ về thanh ngang */}
      <Chevron y={-96} dir="down" color={accent} />
      <Chevron y={-44} dir="down" color={accent} />
      <Chevron y={132} dir="up" color={accent} />
      <Chevron y={184} dir="up" color={accent} />
      {/* mũi tên vươn lên từ gốc */}
      <path d={`M ${CX},208 L ${CX + 50},268 L ${CX + 29},268 L ${CX + 29},300 L ${CX - 29},300 L ${CX - 29},268 L ${CX - 50},268 Z`} fill={main} />
    </svg>
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

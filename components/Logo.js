export function LogoWordmark({ dark = false, className = '' }) {
  const main = dark ? '#FFFFFF' : '#0E6B3D';
  const channel = dark ? '#0C5D34' : '#FFFFFF';
  const swoosh = dark ? '#7AC143' : '#0E6B3D';
  return (
    <svg viewBox="0 -70 350 245" className={className} role="img" aria-label="Logo SET">
      <path d="M 99.5,64.6 A 27 27 0 1 0 75,103 A 27 27 0 1 1 50.5,141.4" fill="none" stroke={main} strokeWidth="26" />
      <circle cx="190" cy="121" r="34" fill="none" stroke={main} strokeWidth="26" />
      <rect x="154" y="110" width="72" height="21" fill={main} />
      <path d="M 194,125 L 238,145 L 226,165 Z" fill={channel} />
      <rect x="272" y="42" width="24" height="126" rx="7" fill={main} />
      <rect x="256" y="66" width="62" height="22" rx="7" fill={main} />
      <path d="M 0,132 C 90,72 170,58 236,62" fill="none" stroke={channel} strokeWidth="9" />
      <path d="M 2,118 C 90,56 175,44 240,50 C 172,54 90,70 14,130 Z" fill={swoosh} />
      <g transform="translate(284,-6)">
        <path d="M 0,-22 C 14,-12 16,6 2,16 C -13,7 -15,-12 0,-22 Z" fill="#7AC143" />
        <path d="M -13,24 l 13,10 13,-10" fill="none" stroke="#7AC143" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -13,39 l 13,10 13,-10" fill="none" stroke={dark ? '#CFE8B8' : '#7AC143'} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
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

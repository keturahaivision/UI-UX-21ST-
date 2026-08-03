'use client';
// Abstract survey / masterplan linework. `progress` 0..1 drives stroke-dashoffset
// so the plan appears to draw itself. Paths are original (not traced from any site).
export default function SurveyLines({ progress = 0, className = '', stroke = '#D81F2A' }) {
  const draw = Math.max(0, Math.min(1, progress));
  const dash = (len) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - draw) });
  return (
    <svg viewBox="0 0 1200 700" className={className} fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g stroke={stroke} strokeWidth="1.2" opacity="0.9">
        {/* baseline grid */}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={'v' + i} x1={i * 100} y1="0" x2={i * 100} y2="700" strokeWidth="0.5" opacity="0.25" style={dash(700)} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={'h' + i} x1="0" y1={i * 100} x2="1200" y2={i * 100} strokeWidth="0.5" opacity="0.25" style={dash(1200)} />
        ))}
        {/* primary road spine */}
        <path d="M60 640 C 300 600, 420 420, 620 400 S 980 360, 1140 120" strokeWidth="2" style={dash(1600)} />
        {/* secondary loops */}
        <path d="M320 560 C 420 500, 520 500, 600 440" style={dash(400)} />
        <path d="M660 400 C 760 380, 860 360, 940 300" style={dash(360)} />
        {/* plot boundaries */}
        <rect x="380" y="300" width="150" height="110" style={dash(520)} />
        <rect x="560" y="250" width="120" height="120" style={dash(480)} />
        <rect x="720" y="200" width="140" height="100" style={dash(480)} />
        {/* roundabout */}
        <circle cx="620" cy="400" r="34" style={dash(214)} />
        {/* survey ticks */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={'t' + i} x1={120 + i * 100} y1="30" x2={120 + i * 100} y2="48" style={dash(18)} />
        ))}
      </g>
    </svg>
  );
}

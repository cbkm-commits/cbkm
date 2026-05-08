import React from 'react';

interface KolamSVGProps {
  size?: number;
  className?: string;
}

const KolamSVG: React.FC<KolamSVGProps> = ({ size = 280, className }) => (
  <svg width={size} height={size} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Concentric circles */}
    {[140, 112, 84, 56, 28].map((r, i) => (
      <circle key={r} cx="150" cy="150" r={r} fill="none"
        stroke="#C9A84C" strokeWidth={1.5 - i * 0.2} opacity={0.6 - i * 0.08} />
    ))}
    {/* Decorative dots on outer circle */}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180;
      return (
        <circle key={`dot-outer-${i}`}
          cx={150 + 140 * Math.cos(angle)} cy={150 + 140 * Math.sin(angle)}
          r="4" fill="#C9A84C" opacity={0.5} />
      );
    })}
    {/* Inner dots */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = ((i * 45 + 22.5) * Math.PI) / 180;
      return (
        <circle key={`dot-inner-${i}`}
          cx={150 + 84 * Math.cos(angle)} cy={150 + 84 * Math.sin(angle)}
          r="3" fill="#8B1A1A" opacity={0.4} />
      );
    })}
    {/* Center dot */}
    <circle cx="150" cy="150" r="6" fill="#C9A84C" opacity={0.7} />
    {/* Petal shapes */}
    {Array.from({ length: 6 }).map((_, i) => {
      const angle = i * 60;
      return (
        <ellipse key={`petal-${i}`}
          cx="150" cy="150" rx="8" ry="30"
          fill="none" stroke="#C9A84C" strokeWidth="0.8" opacity="0.3"
          transform={`rotate(${angle} 150 150) translate(0 -56)`} />
      );
    })}
  </svg>
);

export default KolamSVG;

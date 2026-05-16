interface EmptyBowlProps {
  className?: string;
  size?: number;
}

export function EmptyBowl({ className = "", size = 160 }: EmptyBowlProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bowl shadow */}
      <ellipse cx="80" cy="140" rx="48" ry="8" fill="#6B4C2A" opacity="0.1" />
      {/* Bowl body */}
      <path
        d="M24 76 Q24 128 80 128 Q136 128 136 76"
        fill="#8a6640"
      />
      {/* Bowl inner */}
      <path
        d="M32 80 Q32 120 80 120 Q128 120 128 80"
        fill="#a07848"
      />
      {/* Bowl inner highlight */}
      <ellipse cx="80" cy="80" rx="48" ry="8" fill="#b88c5a" opacity="0.5" />
      {/* Bowl rim */}
      <ellipse cx="80" cy="76" rx="56" ry="13" fill="#8a6640" />
      <ellipse cx="80" cy="76" rx="48" ry="10" fill="#9e7a52" />
      {/* Empty interior – subtle shine */}
      <ellipse cx="68" cy="95" rx="12" ry="6" fill="#c4985e" opacity="0.25" transform="rotate(-15 68 95)" />
      {/* Fork */}
      <g transform="translate(100, 40) rotate(20)">
        <rect x="-1.5" y="0" width="3" height="40" rx="1.5" fill="#c4a882" />
        <rect x="-7" y="0" width="2" height="14" rx="1" fill="#c4a882" />
        <rect x="-3" y="0" width="2" height="12" rx="1" fill="#c4a882" />
        <rect x="1" y="0" width="2" height="12" rx="1" fill="#c4a882" />
        <rect x="5" y="0" width="2" height="14" rx="1" fill="#c4a882" />
      </g>
      {/* Small leaf accent */}
      <path d="M55 65 Q60 55 72 54 Q65 63 55 65Z" fill="#8FAF6E" opacity="0.6" />
    </svg>
  );
}

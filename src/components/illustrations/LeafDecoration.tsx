interface LeafDecorationProps {
  className?: string;
  variant?: "left" | "right" | "top";
  size?: number;
  opacity?: number;
}

export function LeafDecoration({
  className = "",
  variant = "left",
  size = 120,
  opacity = 0.18,
}: LeafDecorationProps) {
  const transforms: Record<string, string> = {
    left: "scale(-1,1)",
    right: "scale(1,1)",
    top: "rotate(-90)",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      <g transform={transforms[variant]}>
        {/* Main large leaf */}
        <path
          d="M10 100 Q20 50 80 20 Q60 70 10 100Z"
          fill="#8FAF6E"
        />
        {/* Secondary leaf */}
        <path
          d="M18 105 Q35 65 85 40 Q65 75 18 105Z"
          fill="#6fa050"
          opacity="0.7"
        />
        {/* Stem */}
        <path
          d="M10 100 Q40 80 80 20"
          stroke="#5a7a3e"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Small accent leaf */}
        <path
          d="M55 55 Q65 40 85 38 Q72 52 55 55Z"
          fill="#a3c47e"
          opacity="0.8"
        />
      </g>
    </svg>
  );
}

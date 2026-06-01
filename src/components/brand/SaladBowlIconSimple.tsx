interface SaladBowlIconSimpleProps {
  className?: string;
  size?: number;
}

/**
 * Simplified salad bowl mark for tiny renders (favicons, app icons).
 *
 * Bold, low-detail version of {@link ./SaladBowlIcon} so it stays legible at
 * 16x16. Used by scripts/generate-favicon.js to produce the favicon set.
 * Keep the markup here in sync with the SVG string in that script.
 */
export function SaladBowlIconSimple({
  className = "",
  size = 64,
}: SaladBowlIconSimpleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bowl body */}
      <path d="M14 56 Q14 102 60 102 Q106 102 106 56 Z" fill="#6B4C2A" />
      {/* Bowl rim */}
      <ellipse cx="60" cy="56" rx="46" ry="13" fill="#8a6640" />
      {/* Greens (a few bold leaves) */}
      <ellipse cx="38" cy="42" rx="21" ry="15" fill="#8FAF6E" transform="rotate(-20 38 42)" />
      <ellipse cx="62" cy="34" rx="23" ry="15" fill="#a3c47e" />
      <ellipse cx="84" cy="44" rx="19" ry="14" fill="#6fa050" transform="rotate(22 84 44)" />
      {/* Tomato */}
      <circle cx="56" cy="48" r="11" fill="#e05454" />
    </svg>
  );
}

interface SaladBowlIconProps {
  className?: string;
  size?: number;
}

export function SaladBowlIcon({ className = "", size = 64 }: SaladBowlIconProps) {
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
      <path
        d="M18 60 Q18 96 60 96 Q102 96 102 60"
        fill="#6B4C2A"
      />
      {/* Bowl inner highlight */}
      <path
        d="M24 62 Q24 88 60 88 Q96 88 96 62"
        fill="#7d5c36"
      />
      {/* Bowl rim */}
      <ellipse cx="60" cy="60" rx="42" ry="11" fill="#8a6640" />
      {/* Romaine / big leaves */}
      <ellipse cx="42" cy="45" rx="18" ry="12" fill="#8FAF6E" transform="rotate(-25 42 45)" />
      <ellipse cx="60" cy="40" rx="20" ry="11" fill="#a3c47e" transform="rotate(5 60 40)" />
      <ellipse cx="78" cy="46" rx="16" ry="11" fill="#8FAF6E" transform="rotate(20 78 46)" />
      {/* Small leaves */}
      <ellipse cx="34" cy="52" rx="10" ry="7" fill="#6fa050" transform="rotate(-15 34 52)" />
      <ellipse cx="86" cy="53" rx="10" ry="6" fill="#6fa050" transform="rotate(15 86 53)" />
      {/* Tomato */}
      <circle cx="53" cy="52" r="8" fill="#e05454" />
      <circle cx="51" cy="50" r="2.5" fill="#f07878" opacity="0.7" />
      <path d="M53 44 Q55 42 57 44" stroke="#6a2020" strokeWidth="1" strokeLinecap="round" />
      {/* Cucumber slice */}
      <circle cx="71" cy="50" r="6" fill="#5da04a" />
      <circle cx="71" cy="50" r="4" fill="#7dc468" />
      <circle cx="71" cy="50" r="1.5" fill="#a8e090" />
      {/* Crouton */}
      <rect x="44" y="57" width="8" height="6" rx="1.5" fill="#d4a857" />
      {/* Avocado */}
      <ellipse cx="62" cy="56" rx="5" ry="6" fill="#6aa84f" />
      <ellipse cx="62" cy="56" rx="3" ry="4" fill="#93c47d" />
      <ellipse cx="62" cy="56" rx="1.5" ry="2" fill="#7d4e1a" />
    </svg>
  );
}

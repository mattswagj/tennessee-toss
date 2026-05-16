interface ConfettiSaladProps {
  className?: string;
  size?: number;
}

export function ConfettiSalad({ className = "", size = 200 }: ConfettiSaladProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Confetti pieces */}
      <rect x="20" y="15" width="10" height="10" rx="2" fill="#8FAF6E" transform="rotate(25 20 15)" opacity="0.8" />
      <rect x="155" y="20" width="8" height="8" rx="1.5" fill="#e05454" transform="rotate(-15 155 20)" opacity="0.8" />
      <circle cx="40" cy="30" r="5" fill="#d4a857" opacity="0.7" />
      <rect x="165" y="50" width="9" height="9" rx="2" fill="#8FAF6E" transform="rotate(40 165 50)" opacity="0.6" />
      <circle cx="170" cy="25" r="4" fill="#5da04a" opacity="0.6" />
      <rect x="25" y="55" width="7" height="7" rx="1.5" fill="#e05454" transform="rotate(-30 25 55)" opacity="0.5" />
      <circle cx="148" cy="15" r="6" fill="#d4a857" opacity="0.5" />
      <rect x="10" y="75" width="6" height="6" rx="1" fill="#8FAF6E" transform="rotate(15 10 75)" opacity="0.4" />

      {/* Bowl body */}
      <path d="M30 105 Q30 155 100 155 Q170 155 170 105" fill="#6B4C2A" />
      <path d="M40 108 Q40 148 100 148 Q160 148 160 108" fill="#7d5c36" />
      {/* Bowl rim */}
      <ellipse cx="100" cy="105" rx="70" ry="17" fill="#8a6640" />

      {/* Big colorful salad mound */}
      <ellipse cx="72" cy="88" rx="26" ry="18" fill="#8FAF6E" transform="rotate(-20 72 88)" />
      <ellipse cx="100" cy="82" rx="30" ry="16" fill="#a3c47e" transform="rotate(5 100 82)" />
      <ellipse cx="128" cy="90" rx="24" ry="17" fill="#8FAF6E" transform="rotate(18 128 90)" />
      <ellipse cx="58" cy="96" rx="16" ry="11" fill="#6fa050" transform="rotate(-10 58 96)" />
      <ellipse cx="142" cy="97" rx="15" ry="10" fill="#6fa050" transform="rotate(12 142 97)" />

      {/* Tomato */}
      <circle cx="84" cy="90" r="11" fill="#e05454" />
      <circle cx="81" cy="87" r="4" fill="#f07878" opacity="0.65" />
      <path d="M84 79 Q86 77 89 79" stroke="#6a2020" strokeWidth="1.5" strokeLinecap="round" />

      {/* Cucumber */}
      <circle cx="116" cy="88" r="9" fill="#5da04a" />
      <circle cx="116" cy="88" r="6" fill="#7dc468" />
      <circle cx="116" cy="88" r="2.5" fill="#a8e090" />

      {/* Avocado */}
      <ellipse cx="100" cy="92" rx="7" ry="9" fill="#6aa84f" />
      <ellipse cx="100" cy="92" rx="4.5" ry="6" fill="#93c47d" />
      <ellipse cx="100" cy="92" rx="2" ry="3" fill="#7d4e1a" />

      {/* Crouton */}
      <rect x="70" y="97" width="11" height="8" rx="2" fill="#d4a857" />
      <rect x="122" y="95" width="9" height="7" rx="2" fill="#d4a857" />

      {/* More confetti below */}
      <circle cx="30" cy="165" r="5" fill="#8FAF6E" opacity="0.5" />
      <rect x="160" y="158" width="8" height="8" rx="2" fill="#e05454" transform="rotate(20 160 158)" opacity="0.5" />
      <circle cx="90" cy="175" r="4" fill="#d4a857" opacity="0.4" />
      <rect x="115" y="170" width="7" height="7" rx="1.5" fill="#5da04a" transform="rotate(-25 115 170)" opacity="0.4" />
    </svg>
  );
}

interface CraftedFreshBadgeProps {
  className?: string;
}

export function CraftedFreshBadge({ className = "" }: CraftedFreshBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-cream text-brown font-script text-lg px-4 py-1.5 rounded-full border border-brown/20 shadow-sm ${className}`}
    >
      <span className="text-base">✦</span>
      Crafted fresh daily!
      <span className="text-base">✦</span>
    </span>
  );
}

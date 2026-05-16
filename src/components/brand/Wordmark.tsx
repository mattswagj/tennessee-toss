interface WordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
}

const SIZES = { sm: "text-2xl", md: "text-3xl", lg: "text-4xl", xl: "text-5xl md:text-6xl" };

export function Wordmark({ className = "", size = "md", color }: WordmarkProps) {
  return (
    <span
      className={`font-script leading-none tracking-wide ${SIZES[size]} ${className}`}
      style={color ? { color } : undefined}
    >
      Tennessee Toss
    </span>
  );
}

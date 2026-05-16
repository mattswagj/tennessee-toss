import { Wordmark } from "./Wordmark";
import { SaladBowlIcon } from "./SaladBowlIcon";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "stacked";
  color?: string;
}

const ICON_SIZE = { sm: 32, md: 40, lg: 56 };
const WORD_SIZE = { sm: "sm", md: "md", lg: "lg" } as const;

export function Logo({
  className = "",
  size = "md",
  orientation = "horizontal",
  color,
}: LogoProps) {
  if (orientation === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <SaladBowlIcon size={ICON_SIZE[size]} />
        <Wordmark size={WORD_SIZE[size]} color={color} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SaladBowlIcon size={ICON_SIZE[size]} />
      <Wordmark size={WORD_SIZE[size]} color={color} />
    </div>
  );
}

type Variant = "leaderboard" | "in-feed" | "sidebar" | "in-article" | "matched";

export function AdSlot({ variant = "leaderboard", label = "Publicidade" }: { variant?: Variant; label?: string }) {
  return (
    <div className={`ad-slot ad-slot--${variant}`} aria-label="Espaço publicitário" role="complementary">
      {label}
    </div>
  );
}

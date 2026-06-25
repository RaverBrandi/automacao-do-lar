export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card shadow-[var(--shadow-card)] overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-20 bg-muted rounded-full" />
        <div className="h-5 w-full bg-muted rounded" />
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded mt-4" />
      </div>
    </div>
  );
}

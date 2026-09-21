export function ProgressBar({
  value,
  max = 100,
  className = "bg-gk-blue-deep",
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

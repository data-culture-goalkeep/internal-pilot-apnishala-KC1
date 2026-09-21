import { cn } from "@/lib/utils";
import type { StackSegment } from "./stacked-bar-chart";

/** One horizontal stacked bar per row — used for SJT "response distribution
 * by situation" and SEL Observation-vs-Self-Report mini-bars. */
export function HorizontalStackedBar({
  rows,
}: {
  rows: { label: string; sublabel?: string; segments: StackSegment[] }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const total = row.segments.reduce((s, seg) => s + seg.value, 0) || 1;
        return (
          <div key={row.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{row.label}</span>
              {row.sublabel && <span className="text-xs text-muted-foreground">{row.sublabel}</span>}
            </div>
            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
              {row.segments.map((seg) => (
                <div
                  key={seg.key}
                  className={cn(seg.className)}
                  style={{ width: `${(seg.value / total) * 100}%` }}
                  title={`${seg.label}: ${seg.value}%`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

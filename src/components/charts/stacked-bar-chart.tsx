import { cn } from "@/lib/utils";

export type StackSegment = { key: string; value: number; className: string; label: string };

/** Vertical stacked bar chart — one bar per category, segments summing to
 * (roughly) 100%. Used for bracket-distribution and Thrive/Resist charts. */
export function StackedBarChart({
  data,
  height = 180,
}: {
  data: { label: string; segments: StackSegment[] }[];
  height?: number;
}) {
  return (
    <div className="flex items-end gap-4 overflow-x-auto pb-1" style={{ height: height + 40 }}>
      {data.map((d) => {
        const total = d.segments.reduce((s, seg) => s + seg.value, 0) || 1;
        return (
          <div key={d.label} className="flex min-w-12 flex-1 flex-col items-center gap-1.5">
            <div
              className="flex w-8 flex-col-reverse overflow-hidden rounded-t-sm"
              style={{ height }}
            >
              {d.segments.map((seg) => (
                <div
                  key={seg.key}
                  className={cn(seg.className)}
                  style={{ height: `${(seg.value / total) * 100}%` }}
                  title={`${seg.label}: ${seg.value}%`}
                />
              ))}
            </div>
            <span className="text-center text-[11px] font-medium text-muted-foreground">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

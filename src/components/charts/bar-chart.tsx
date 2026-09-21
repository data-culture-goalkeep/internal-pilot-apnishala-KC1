import { cn } from "@/lib/utils";

/** Simple vertical bar chart, one bar per category. Optional lighter
 * "compare" bar rendered alongside (e.g. grade vs. all-grades). */
export function BarChart({
  data,
  max = 100,
  unit = "%",
  barClassName = "bg-gk-blue-deep",
  compareClassName = "bg-gk-blue-deep/25",
  height = 160,
}: {
  data: { label: string; value: number; compareValue?: number }[];
  max?: number;
  unit?: string;
  barClassName?: string;
  compareClassName?: string;
  height?: number;
}) {
  const scale = (v: number) => Math.max(2, Math.round((Math.min(v, max) / max) * height));
  return (
    <div className="flex items-end gap-3 overflow-x-auto pb-1" style={{ height: height + 40 }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-10 flex-1 flex-col items-center gap-1.5">
          <div className="flex items-end gap-1" style={{ height }}>
            <div
              className={cn("w-4 rounded-t-sm", barClassName)}
              style={{ height: scale(d.value) }}
              title={`${d.label}: ${d.value}${unit}`}
            />
            {d.compareValue !== undefined && (
              <div
                className={cn("w-4 rounded-t-sm", compareClassName)}
                style={{ height: scale(d.compareValue) }}
                title={`All grades: ${d.compareValue}${unit}`}
              />
            )}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

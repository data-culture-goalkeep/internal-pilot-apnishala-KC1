import { cn } from "@/lib/utils";

const LABEL_RESERVED_PX = 16;

/** Simple vertical bar chart, one bar per category. Optional lighter
 * "compare" bar rendered alongside (e.g. grade vs. all-grades). Each bar
 * shows its numeric value above it — the fixed-height bar area reserves
 * LABEL_RESERVED_PX so the label never has to overflow it. */
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
  const barMaxHeight = height - LABEL_RESERVED_PX;
  const scale = (v: number) => Math.max(2, Math.round((Math.min(v, max) / max) * barMaxHeight));
  return (
    <div className="flex items-end gap-3 overflow-x-auto pb-1" style={{ height: height + 40 }}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-10 flex-1 flex-col items-center gap-1.5">
          <div className="flex items-end gap-1" style={{ height }}>
            <div className="flex flex-col items-center justify-end" style={{ height }}>
              <span className="mb-1 text-[10px] font-semibold text-foreground">
                {d.value}
                {unit}
              </span>
              <div
                className={cn("w-4 rounded-t-sm", barClassName)}
                style={{ height: scale(d.value) }}
                title={`${d.label}: ${d.value}${unit}`}
              />
            </div>
            {d.compareValue !== undefined && (
              <div className="flex flex-col items-center justify-end" style={{ height }}>
                <span className="mb-1 text-[10px] font-medium text-muted-foreground">
                  {d.compareValue}
                  {unit}
                </span>
                <div
                  className={cn("w-4 rounded-t-sm", compareClassName)}
                  style={{ height: scale(d.compareValue) }}
                  title={`All grades: ${d.compareValue}${unit}`}
                />
              </div>
            )}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

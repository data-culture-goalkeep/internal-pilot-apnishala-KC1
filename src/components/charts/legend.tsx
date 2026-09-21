export function ChartLegend({
  items,
}: {
  items: { label: string; className: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`size-2.5 rounded-sm ${item.className}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

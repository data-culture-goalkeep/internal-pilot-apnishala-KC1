"use client";

import { useKhojData } from "./khoj-data-provider";
import type { KhojData } from "./types";

export function KhojDataGate({
  children,
}: {
  children: (data: KhojData) => React.ReactNode;
}) {
  const { data, error } = useKhojData();

  if (error) {
    return <div className="p-6 text-sm text-destructive">{error}</div>;
  }
  if (!data) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }
  return <>{children(data)}</>;
}

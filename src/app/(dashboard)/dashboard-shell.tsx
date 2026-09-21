"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useKhojData } from "@/lib/khoj/khoj-data-provider";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/formative", label: "Formative Assessments" },
  { href: "/summative", label: "Summative Assessments" },
  { href: "/sel", label: "SEL & Holistic" },
  { href: "/growth", label: "Individual Growth" },
  { href: "/attendance", label: "Attendance + Enrollment" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, role, setRole, gradeCode, setGradeCode } = useKhojData();
  const grades = data?.grades ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gk-yellow text-base">
              🪁
            </span>
            <Link href="/overview" className="font-heading text-lg font-semibold">
              Khoj Dashboard
            </Link>
          </div>
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-sm">
            {(["teacher", "leadership"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium capitalize transition-colors",
                  role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto px-6 pb-3">
          <span className="mr-1 shrink-0 text-xs font-medium tracking-wide text-muted-foreground">
            SELECT GRADE
          </span>
          <button
            onClick={() => setGradeCode("All")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              gradeCode === "All"
                ? "border-gk-yellow bg-gk-yellow text-gk-ink"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setGradeCode(g.code)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                gradeCode === g.code
                  ? "border-gk-yellow bg-gk-yellow text-gk-ink"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {g.code}
            </button>
          ))}
        </div>
      </header>
      <div className="flex">
        <nav className="hidden w-56 shrink-0 flex-col gap-0.5 border-r border-border bg-card px-3 py-4 md:flex">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-gk-yellow/25 text-gk-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn("size-1.5 rounded-full", active ? "bg-gk-yellow" : "bg-transparent")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

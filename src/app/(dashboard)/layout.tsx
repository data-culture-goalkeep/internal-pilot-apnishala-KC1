import { KhojDataProvider } from "@/lib/khoj/khoj-data-provider";
import { DashboardShell } from "./dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <KhojDataProvider>
      <DashboardShell>{children}</DashboardShell>
    </KhojDataProvider>
  );
}

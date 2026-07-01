import { ReportProvider } from "@/lib/ReportContext";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <ReportProvider>{children}</ReportProvider>
    </RequireAuth>
  );
}

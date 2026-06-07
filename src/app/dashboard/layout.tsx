import DashboardLayout from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/AuthGuard"

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><DashboardLayout>{children}</DashboardLayout></AuthGuard>;
}

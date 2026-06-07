import { Sidebar } from "./sidebar"
import { Header } from "./header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      {/* Sidebar شامل نوار آیکون + زیرمنو */}
      <Sidebar />

      {/* بخش اصلی */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-white">{children}</main>
      </div>
    </div>
  )
}

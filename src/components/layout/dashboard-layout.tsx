import { Sidebar } from "./sidebar";
import { Header } from "./header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="glass-page flex h-screen overflow-hidden" dir="rtl">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-12 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-52 h-[28rem] w-[28rem] rounded-full bg-info/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/2 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-muted/30 blur-3xl" />

        <Header />

        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="p-5">
            <section className="glass-workspace min-h-[calc(100vh-7rem)] rounded-[2.25rem] p-5">
              <div className="mx-auto max-w-[1600px]">{children}</div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
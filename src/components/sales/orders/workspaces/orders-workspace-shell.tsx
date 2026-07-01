import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

interface OrdersWorkspaceShellProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "rose" | "violet" | "sky" | "amber" | "emerald" | "slate";
  actionLabel?: string;
  actionHref?: string;
  cards?: {
    label: string;
    value: string;
    description: string;
  }[];
  children?: React.ReactNode;
}

const toneClasses = {
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-400/[0.08]",
    text: "text-rose-700 dark:text-rose-300",
    glow: "bg-rose-500/10",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-400/[0.08]",
    text: "text-violet-700 dark:text-violet-300",
    glow: "bg-violet-500/10",
  },
  sky: {
    bg: "bg-sky-500/10 dark:bg-sky-400/[0.08]",
    text: "text-sky-700 dark:text-sky-300",
    glow: "bg-sky-500/10",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-400/[0.08]",
    text: "text-amber-700 dark:text-amber-300",
    glow: "bg-amber-500/10",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/[0.08]",
    text: "text-emerald-700 dark:text-emerald-300",
    glow: "bg-emerald-500/10",
  },
  slate: {
    bg: "bg-black/[0.04] dark:bg-white/[0.06]",
    text: "text-muted-foreground",
    glow: "bg-primary/10",
  },
};

export function OrdersWorkspaceShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone,
  actionLabel,
  actionHref,
  cards = [],
  children,
}: OrdersWorkspaceShellProps) {
  const toneClass = toneClasses[tone];

  return (
    <main className="glass-page min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl dark:bg-white/[0.04] dark:shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div
            className={[
              "pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full blur-3xl",
              toneClass.glow,
            ].join(" ")}
          />

          <div className="pointer-events-none absolute right-20 top-0 h-px w-72 bg-gradient-to-l from-transparent via-white/70 to-transparent dark:via-white/10" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  toneClass.bg,
                  toneClass.text,
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <p className={["text-xs font-black", toneClass.text].join(" ")}>
                  {eyebrow}
                </p>

                <h1 className="mt-1 text-2xl font-black text-foreground">
                  {title}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>

            {actionHref && actionLabel ? (
              <Link
                href={actionHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/65 px-4 py-2 text-sm font-black text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
              >
                {actionLabel}
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </section>

        {cards.length ? (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <article
                key={card.label}
                className="rounded-[1.8rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]"
              >
                <p className="text-xs font-black text-muted-foreground">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-black text-foreground">
                  {card.value}
                </p>

                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {card.description}
                </p>
              </article>
            ))}
          </section>
        ) : null}

        {children ? (
          children
        ) : (
          <section className="rounded-[2rem] bg-white/55 p-6 text-center shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
            <p className="text-sm font-bold text-muted-foreground">
              این صفحه در این فاز فقط به عنوان shell ساخته شده و در فازهای بعدی
              به لیست و ابزار عملیاتی تبدیل می‌شود.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
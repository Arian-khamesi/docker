"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileSearch,
  ListChecks,
  PackageCheck,
  ReceiptText,
  Repeat2,
  RotateCcw,
  Route,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";

import {
  SALES_ORDERS_BASE_PATH,
  SALES_ORDERS_EXCHANGES_PATH,
  SALES_ORDERS_KIYAN_SALE_PATH,
  SALES_ORDERS_MANUAL_PATH,
  SALES_ORDERS_RETURNS_PATH,
  SALES_ORDERS_SNAPP_PATH,
} from "@/components/sales/orders/sales-orders.constants";

type OperatorTone =
  | "sky"
  | "violet"
  | "rose"
  | "amber"
  | "emerald"
  | "slate";

type OperatorSectionVariant =
  | "data"
  | "status"
  | "actions"
  | "followup"
  | "review"
  | "payload"
  | "result";

type WorkflowStepStatus = "done" | "current" | "todo" | "warning";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface OperatorAction {
  label: string;
  href: string;
  tone?: OperatorTone;
}

interface OperatorGuideItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: OperatorTone;
  badge: string;
}

interface OperatorPageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  pageType:
    | "overview"
    | "detail"
    | "workspace"
    | "workflow"
    | "operations-center";
  breadcrumb?: BreadcrumbItem[];
  goal?: string;
  currentStatus?: string;
  recommendedAction?: string;
  afterAction?: string;
  primaryAction?: OperatorAction;
  secondaryActions?: OperatorAction[];
}

interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status?: WorkflowStepStatus;
}

interface OrderWorkflowStepperProps {
  title?: string;
  description?: string;
  steps: WorkflowStep[];
}

interface OperatorSectionProps {
  title: string;
  description?: string;
  variant: OperatorSectionVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
  action?: OperatorAction;
  className?: string;
}

interface NextActionCardProps {
  title?: string;
  reason: string;
  actionLabel: string;
  actionHref: string;
  description?: string;
  tone?: OperatorTone;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

interface TaskReasonProps {
  reason: string;
  expectedAction: string;
  tone?: OperatorTone;
}

const mainGuideItems: OperatorGuideItem[] = [
  {
    title: "همه سفارشات",
    description:
      "برای دیدن کل سفارش‌ها، فیلتر، جستجو و ورود به جزئیات هر سفارش.",
    href: SALES_ORDERS_BASE_PATH,
    icon: ReceiptText,
    tone: "slate",
    badge: "مشاهده کلی",
  },
  {
    title: "مرکز عملیات کیان",
    description:
      "برای پیگیری فروش‌های ثبت‌نشده، مرجوعی‌های بدون سند و تعویض‌های ناقص کیان.",
    href: SALES_ORDERS_KIYAN_SALE_PATH,
    icon: BadgeDollarSign,
    tone: "sky",
    badge: "صف کارهای کیان",
  },
  {
    title: "سفارش‌های اسنپ",
    description:
      "برای بررسی SnappPay، وضعیت sync، مرجوعی/تعویض اسنپ و آپدیت سبد.",
    href: SALES_ORDERS_SNAPP_PATH,
    icon: Smartphone,
    tone: "sky",
    badge: "SnappPay",
  },
  {
    title: "مرجوعی‌ها",
    description:
      "برای پیگیری سفارش‌هایی که مرجوعی دارند یا سند مرجوعی کیان ندارند.",
    href: SALES_ORDERS_RETURNS_PATH,
    icon: RotateCcw,
    tone: "rose",
    badge: "پیگیری مرجوعی",
  },
  {
    title: "تعویض‌ها",
    description:
      "برای پیگیری تعویض، سند برگشت، فروش جایگزین و اختلاف مبلغ.",
    href: SALES_ORDERS_EXCHANGES_PATH,
    icon: Repeat2,
    tone: "violet",
    badge: "پیگیری تعویض",
  },
  {
    title: "سفارش‌های دستی",
    description:
      "برای بررسی و مدیریت سفارش‌هایی که دستی یا توسط اپراتور ثبت شده‌اند.",
    href: SALES_ORDERS_MANUAL_PATH,
    icon: ClipboardList,
    tone: "amber",
    badge: "Manual",
  },
];

const sectionLegend = [
  {
    title: "داده و وضعیت فعلی",
    description: "اطلاعات سفارش، مشتری، پرداخت، کیان، اسنپ و وضعیت فعلی.",
    icon: Eye,
    tone: "sky" as const,
  },
  {
    title: "پیگیری و هشدار",
    description: "موارد ناقص، مغایرت‌ها، sync نشده‌ها و نیازمند بررسی.",
    icon: AlertTriangle,
    tone: "amber" as const,
  },
  {
    title: "عملیات",
    description: "فرم‌ها، ساخت payload، ثبت کیان، مرجوعی، تعویض و آپدیت اسنپ.",
    icon: Wand2,
    tone: "violet" as const,
  },
  {
    title: "نتیجه و ثبت نهایی",
    description: "barcode، status، externalSync، action log و خروجی عملیات.",
    icon: CheckCircle2,
    tone: "emerald" as const,
  },
];

export function OrderOperatorGuide() {
  return (
    <section className="relative overflow-hidden rounded-[2.2rem] bg-white/55 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-700 dark:text-sky-300">
            <Route className="h-4 w-4" />
            نقشه کار با سفارشات
          </div>

          <h2 className="mt-4 text-2xl font-black text-foreground">
            دنبال چه کاری هستی؟
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            این بخش برای اینه که اپراتور بدونه هر کاری مربوط به کدوم صفحه است.
            مشاهده، پیگیری و عملیات از هم جدا شده‌اند تا بین صفحات سفارشات گم
            نشی.
          </p>
        </div>

        <div className="rounded-[1.6rem] bg-slate-950 px-4 py-3 text-xs font-bold leading-6 text-slate-100 shadow-[0_16px_34px_rgba(15,23,42,0.18)]">
          <p className="font-black text-white">قاعده کلی</p>
          <p className="mt-1 text-slate-300">
            دیدن سفارش ← لیست/جزئیات
            <br />
            پیگیری چند سفارش ← workspace
            <br />
            انجام عملیات ← workflow اختصاصی همان سفارش
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {mainGuideItems.map((item) => (
          <OperatorGuideCard key={item.href} item={item} />
        ))}
      </div>

      <div className="relative mt-5 rounded-[1.8rem] bg-white/45 p-4 dark:bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-700 dark:text-violet-300" />
          <h3 className="text-sm font-black text-foreground">
            رنگ‌بندی و نقش بخش‌ها در صفحات سفارش
          </h3>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {sectionLegend.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.4rem] bg-white/45 p-3 dark:bg-white/[0.04]"
            >
              <div
                className={[
                  "mb-3 flex h-10 w-10 items-center justify-center rounded-2xl",
                  getToneSoftClass(item.tone),
                ].join(" ")}
              >
                <item.icon className="h-5 w-5" />
              </div>

              <p className="text-xs font-black text-foreground">
                {item.title}
              </p>

              <p className="mt-1 text-[11px] font-bold leading-5 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrderOperatorPageHeader({
  eyebrow,
  title,
  description,
  pageType,
  breadcrumb,
  goal,
  currentStatus,
  recommendedAction,
  afterAction,
  primaryAction,
  secondaryActions,
}: OperatorPageHeaderProps) {
  const pageMeta = getPageTypeMeta(pageType);

  return (
    <section
      className={[
        "relative overflow-hidden rounded-[2.2rem] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl",
        getToneBackgroundClass(pageMeta.tone),
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-white/20 blur-3xl" />

      <div className="relative">
        {breadcrumb?.length ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-black text-muted-foreground">
            {breadcrumb.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="transition hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{item.label}</span>
                )}

                {index < breadcrumb.length - 1 ? (
                  <ArrowLeft className="h-3.5 w-3.5" />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black",
                  getToneSoftClass(pageMeta.tone),
                ].join(" ")}
              >
                <pageMeta.icon className="h-4 w-4" />
                {pageMeta.label}
              </span>

              {eyebrow ? (
                <span className="rounded-full bg-white/45 px-3 py-1 text-xs font-black text-muted-foreground dark:bg-white/[0.05]">
                  {eyebrow}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-2xl font-black text-foreground">
              {title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </div>

          {(primaryAction || secondaryActions?.length) ? (
            <div className="flex flex-wrap gap-2 xl:justify-end">
              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] px-4 text-xs font-black text-white shadow-[0_14px_32px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5",
                    getToneButtonClass(primaryAction.tone ?? pageMeta.tone),
                  ].join(" ")}
                >
                  {primaryAction.label}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              ) : null}

              {secondaryActions?.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex h-11 items-center justify-center rounded-[1.3rem] bg-white/55 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.05]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {(goal || currentStatus || recommendedAction || afterAction) ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {goal ? (
              <HeaderInfoBox
                label="هدف این صفحه"
                value={goal}
                tone={pageMeta.tone}
                icon={FileSearch}
              />
            ) : null}

            {currentStatus ? (
              <HeaderInfoBox
                label="وضعیت فعلی"
                value={currentStatus}
                tone="amber"
                icon={AlertTriangle}
              />
            ) : null}

            {recommendedAction ? (
              <HeaderInfoBox
                label="اقدام پیشنهادی"
                value={recommendedAction}
                tone="violet"
                icon={Wand2}
              />
            ) : null}

            {afterAction ? (
              <HeaderInfoBox
                label="بعد از انجام"
                value={afterAction}
                tone="emerald"
                icon={CheckCircle2}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function OrderWorkflowStepper({
  title = "مراحل انجام کار",
  description,
  steps,
}: OrderWorkflowStepperProps) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
          <ListChecks className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-black text-foreground">{title}</h2>

          {description ? (
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={[
              "relative rounded-[1.4rem] p-3",
              getStepClass(step.status ?? "todo"),
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-xs font-black dark:bg-white/[0.08]">
                {index + 1}
              </span>

              <span className="text-xs font-black">{step.title}</span>
            </div>

            {step.description ? (
              <p className="mt-2 text-[11px] font-bold leading-5 opacity-80">
                {step.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function OrderOperatorSection({
  title,
  description,
  variant,
  icon,
  children,
  action,
  className,
}: OperatorSectionProps) {
  const meta = getSectionVariantMeta(variant);
  const Icon = icon ?? meta.icon;

  return (
    <section
      className={[
        "rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              getToneSoftClass(meta.tone),
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-foreground">{title}</h2>

              <span
                className={[
                  "rounded-full px-3 py-1 text-[11px] font-black",
                  getToneSoftClass(meta.tone),
                ].join(" ")}
              >
                {meta.label}
              </span>
            </div>

            {description ? (
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {action ? (
          <Link
            href={action.href}
            className={[
              "inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] px-4 text-xs font-black text-white transition hover:-translate-y-0.5",
              getToneButtonClass(action.tone ?? meta.tone),
            ].join(" ")}
          >
            {action.label}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

export function OrderNextActionCard({
  title = "اقدام بعدی پیشنهادی",
  reason,
  actionLabel,
  actionHref,
  description,
  tone = "violet",
  secondaryActionLabel,
  secondaryActionHref,
}: NextActionCardProps) {
  return (
    <div
      className={[
        "rounded-[1.8rem] p-4",
        getToneSubtlePanelClass(tone),
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            <h3 className="text-sm font-black">{title}</h3>
          </div>

          <p className="mt-3 text-sm font-bold leading-7">
            <span className="font-black">علت: </span>
            {reason}
          </p>

          {description ? (
            <p className="mt-2 text-xs font-bold leading-6 opacity-80">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={actionHref}
            className={[
              "inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] px-4 text-xs font-black text-white transition hover:-translate-y-0.5",
              getToneButtonClass(tone),
            ].join(" ")}
          >
            {actionLabel}
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {secondaryActionHref && secondaryActionLabel ? (
            <Link
              href={secondaryActionHref}
              className="inline-flex h-11 items-center justify-center rounded-[1.3rem] bg-white/60 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
            >
              {secondaryActionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function OrderTaskReason({
  reason,
  expectedAction,
  tone = "amber",
}: TaskReasonProps) {
  return (
    <div
      className={[
        "rounded-[1.4rem] px-4 py-3 text-xs font-bold leading-6",
        getToneSubtlePanelClass(tone),
      ].join(" ")}
    >
      <p>
        <span className="font-black">علت نمایش این مورد: </span>
        {reason}
      </p>

      <p className="mt-1">
        <span className="font-black">کاری که باید انجام شود: </span>
        {expectedAction}
      </p>
    </div>
  );
}

function OperatorGuideCard({ item }: { item: OperatorGuideItem }) {
  return (
    <Link
      href={item.href}
      className="group rounded-[1.8rem] bg-white/45 p-4 transition hover:-translate-y-0.5 hover:bg-white/65 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105",
            getToneSoftClass(item.tone),
          ].join(" ")}
        >
          <item.icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-foreground">{item.title}</h3>

            <span
              className={[
                "rounded-full px-2.5 py-1 text-[10px] font-black",
                getToneSoftClass(item.tone),
              ].join(" ")}
            >
              {item.badge}
            </span>
          </div>

          <p className="mt-2 text-xs font-bold leading-6 text-muted-foreground">
            {item.description}
          </p>
        </div>

        <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-x-1 group-hover:text-foreground" />
      </div>
    </Link>
  );
}

function HeaderInfoBox({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: OperatorTone;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/45 p-3 dark:bg-white/[0.04]">
      <div
        className={[
          "mb-3 flex h-9 w-9 items-center justify-center rounded-2xl",
          getToneSoftClass(tone),
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-[11px] font-black text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-black leading-6 text-foreground">
        {value}
      </p>
    </div>
  );
}

function getPageTypeMeta(
  pageType: OperatorPageHeaderProps["pageType"]
): {
  label: string;
  tone: OperatorTone;
  icon: LucideIcon;
} {
  if (pageType === "overview") {
    return {
      label: "صفحه مشاهده کلی",
      tone: "slate",
      icon: Eye,
    };
  }

  if (pageType === "detail") {
    return {
      label: "جزئیات و تصمیم‌گیری",
      tone: "sky",
      icon: FileSearch,
    };
  }

  if (pageType === "workspace") {
    return {
      label: "صفحه پیگیری / Inbox",
      tone: "amber",
      icon: ClipboardList,
    };
  }

  if (pageType === "operations-center") {
    return {
      label: "مرکز عملیات",
      tone: "violet",
      icon: ListChecks,
    };
  }

  return {
    label: "صفحه انجام عملیات",
    tone: "emerald",
    icon: Wand2,
  };
}

function getSectionVariantMeta(
  variant: OperatorSectionVariant
): {
  label: string;
  tone: OperatorTone;
  icon: LucideIcon;
} {
  if (variant === "data") {
    return {
      label: "داده",
      tone: "sky",
      icon: Eye,
    };
  }

  if (variant === "status") {
    return {
      label: "وضعیت فعلی",
      tone: "slate",
      icon: FileSearch,
    };
  }

  if (variant === "actions") {
    return {
      label: "عملیات",
      tone: "violet",
      icon: Wand2,
    };
  }

  if (variant === "followup") {
    return {
      label: "پیگیری",
      tone: "amber",
      icon: AlertTriangle,
    };
  }

  if (variant === "review") {
    return {
      label: "بررسی",
      tone: "rose",
      icon: FileSearch,
    };
  }

  if (variant === "payload") {
    return {
      label: "Payload",
      tone: "slate",
      icon: PackageCheck,
    };
  }

  return {
    label: "نتیجه",
    tone: "emerald",
    icon: CheckCircle2,
  };
}

function getStepClass(status: WorkflowStepStatus) {
  if (status === "done") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "current") {
    return "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20 dark:text-violet-300";
  }

  if (status === "warning") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "bg-white/45 text-muted-foreground dark:bg-white/[0.04]";
}

function getToneSoftClass(tone: OperatorTone) {
  if (tone === "sky") {
    return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  }

  if (tone === "violet") {
    return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }

  if (tone === "rose") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (tone === "amber") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (tone === "emerald") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
}

function getToneButtonClass(tone: OperatorTone) {
  if (tone === "sky") return "bg-sky-600";
  if (tone === "violet") return "bg-violet-600";
  if (tone === "rose") return "bg-rose-600";
  if (tone === "amber") return "bg-amber-600";
  if (tone === "emerald") return "bg-emerald-600";

  return "bg-slate-700";
}

function getToneBackgroundClass(tone: OperatorTone) {
  if (tone === "sky") return "bg-sky-500/[0.08] dark:bg-sky-400/[0.07]";
  if (tone === "violet") return "bg-violet-500/[0.08] dark:bg-violet-400/[0.07]";
  if (tone === "rose") return "bg-rose-500/[0.08] dark:bg-rose-400/[0.07]";
  if (tone === "amber") return "bg-amber-500/[0.10] dark:bg-amber-400/[0.07]";
  if (tone === "emerald") return "bg-emerald-500/[0.08] dark:bg-emerald-400/[0.07]";

  return "bg-white/55 dark:bg-white/[0.04]";
}

function getToneSubtlePanelClass(tone: OperatorTone) {
  if (tone === "sky") return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  if (tone === "violet") {
    return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
  }
  if (tone === "rose") return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  if (tone === "amber") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  if (tone === "emerald") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
}
"use client";

import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Eye,
  FileCode2,
  Flag,
  ListChecks,
  Loader2,
  PackageCheck,
  Route,
  Save,
  ShieldCheck,
  Wand2,
} from "lucide-react";

export type OrderWorkflowTone =
  | "sky"
  | "violet"
  | "rose"
  | "amber"
  | "emerald"
  | "slate";

export type OrderWorkflowSectionVariant =
  | "context"
  | "data"
  | "input"
  | "validation"
  | "payload"
  | "submit"
  | "result";

export type OrderWorkflowStepStatus =
  | "done"
  | "current"
  | "todo"
  | "warning"
  | "blocked";

export interface OrderWorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: OrderWorkflowStepStatus;
}

interface WorkflowBreadcrumbItem {
  label: string;
  href?: string;
}

interface WorkflowAction {
  label: string;
  href: string;
  tone?: OrderWorkflowTone;
}

interface OrderWorkflowShellProps {
  eyebrow: string;
  title: string;
  description: string;
  orderLabel?: string;
  tone?: OrderWorkflowTone;
  icon?: ElementType;
  breadcrumb?: WorkflowBreadcrumbItem[];
  goal: string;
  currentStep: string;
  expectedResult: string;
  primaryAction?: WorkflowAction;
  secondaryActions?: WorkflowAction[];
  children: ReactNode;
}

interface OrderWorkflowStepperProps {
  title?: string;
  description?: string;
  steps: OrderWorkflowStep[];
}

interface OrderWorkflowSectionProps {
  title: string;
  description: string;
  variant: OrderWorkflowSectionVariant;
  icon?: ElementType;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface WorkflowInfoCardProps {
  label: string;
  value: string;
  tone?: OrderWorkflowTone;
  icon?: ElementType;
}

interface WorkflowResultBoxProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  details?: ReactNode;
}

interface WorkflowPayloadPreviewProps {
  payload: unknown;
  title?: string;
  description?: string;
}

export function OrderWorkflowShell({
  eyebrow,
  title,
  description,
  orderLabel,
  tone = "violet",
  icon: Icon = Route,
  breadcrumb,
  goal,
  currentStep,
  expectedResult,
  primaryAction,
  secondaryActions,
  children,
}: OrderWorkflowShellProps) {
  return (
    <div className="space-y-4">
      <section
        className={[
          "relative overflow-hidden rounded-[2.2rem] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl",
          getToneBackgroundClass(tone),
        ].join(" ")}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          {breadcrumb?.length ? (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-black text-muted-foreground">
              {breadcrumb.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-2"
                >
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

          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black",
                    getToneSoftClass(tone),
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {eyebrow}
                </span>

                {orderLabel ? (
                  <span className="rounded-full bg-white/45 px-3 py-1 text-xs font-black text-muted-foreground dark:bg-white/[0.05]">
                    {orderLabel}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 text-2xl font-black text-foreground">
                {title}
              </h1>

              <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-muted-foreground">
                {description}
              </p>
            </div>

            {(primaryAction || secondaryActions?.length) ? (
              <div className="flex w-full shrink-0 flex-wrap gap-2 xl:w-auto xl:justify-end">
                {primaryAction ? (
                  <Link
                    href={primaryAction.href}
                    className={[
                      "inline-flex h-11 items-center justify-center gap-2 rounded-[1.3rem] px-4 text-xs font-black text-white shadow-[0_14px_32px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5",
                      getToneButtonClass(primaryAction.tone ?? tone),
                    ].join(" ")}
                  >
                    {primaryAction.label}
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                ) : null}

                {secondaryActions?.map((action) => (
                  <Link
                    key={`${action.label}-${action.href}`}
                    href={action.href}
                    className="inline-flex h-11 items-center justify-center rounded-[1.3rem] bg-white/55 px-4 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.05]"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <WorkflowInfoCard
              label="هدف این صفحه"
              value={goal}
              tone={tone}
              icon={Flag}
            />

            <WorkflowInfoCard
              label="مرحله فعلی"
              value={currentStep}
              tone="amber"
              icon={ListChecks}
            />

            <WorkflowInfoCard
              label="خروجی مورد انتظار"
              value={expectedResult}
              tone="emerald"
              icon={CheckCircle2}
            />
          </div>
        </div>
      </section>

      {children}
    </div>
  );
}

export function OrderWorkflowStepper({
  title = "مسیر انجام عملیات",
  description = "این مراحل کمک می‌کند اپراتور بداند الان کجای workflow قرار دارد و قدم بعدی چیست.",
  steps,
}: OrderWorkflowStepperProps) {
  return (
    <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
          <Route className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-black text-foreground">{title}</h2>

          <p className="mt-2 text-sm font-bold leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={[
              "rounded-[1.4rem] p-3",
              getStepClass(step.status),
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-black dark:bg-white/[0.08]">
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

export function OrderWorkflowSection({
  title,
  description,
  variant,
  icon,
  action,
  children,
  className,
}: OrderWorkflowSectionProps) {
  const meta = getSectionMeta(variant);
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

            <p className="mt-2 text-sm font-bold leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

export function WorkflowInfoCard({
  label,
  value,
  tone = "slate",
  icon: Icon = ShieldCheck,
}: WorkflowInfoCardProps) {
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

export function WorkflowResultBox({
  type,
  title,
  message,
  details,
}: WorkflowResultBoxProps) {
  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
        ? AlertTriangle
        : type === "warning"
          ? AlertTriangle
          : ClipboardCheck;

  const tone =
    type === "success"
      ? "emerald"
      : type === "error"
        ? "rose"
        : type === "warning"
          ? "amber"
          : "sky";

  return (
    <div
      className={[
        "rounded-[1.7rem] p-4",
        getToneSubtlePanelClass(tone),
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />

        <div>
          <h3 className="text-sm font-black">{title}</h3>

          <p className="mt-2 text-sm font-bold leading-7">{message}</p>

          {details ? <div className="mt-3">{details}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function WorkflowPayloadPreview({
  payload,
  title = "Preview Payload",
  description = "این پیش‌نمایش برای کنترل نهایی قبل از ارسال درخواست است.",
}: WorkflowPayloadPreviewProps) {
  return (
    <OrderWorkflowSection
      title={title}
      description={description}
      variant="payload"
      icon={FileCode2}
    >
      <pre
        dir="ltr"
        className="max-h-[440px] overflow-auto rounded-[1.4rem] bg-slate-950 p-4 text-left text-xs leading-6 text-slate-100"
      >
        {JSON.stringify(payload, null, 2)}
      </pre>
    </OrderWorkflowSection>
  );
}

function getSectionMeta(variant: OrderWorkflowSectionVariant): {
  label: string;
  tone: OrderWorkflowTone;
  icon: ElementType;
} {
  if (variant === "context") {
    return { label: "Context", tone: "sky", icon: Eye };
  }

  if (variant === "data") {
    return { label: "Data", tone: "slate", icon: Database };
  }

  if (variant === "input") {
    return { label: "Input", tone: "violet", icon: Wand2 };
  }

  if (variant === "validation") {
    return { label: "Validation", tone: "amber", icon: ShieldCheck };
  }

  if (variant === "payload") {
    return { label: "Payload", tone: "slate", icon: FileCode2 };
  }

  if (variant === "submit") {
    return { label: "Submit", tone: "emerald", icon: Save };
  }

  return { label: "Result", tone: "emerald", icon: PackageCheck };
}

function getStepClass(status: OrderWorkflowStepStatus) {
  if (status === "done") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "current") {
    return "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20 dark:text-violet-300";
  }

  if (status === "warning") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (status === "blocked") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  return "bg-white/45 text-muted-foreground dark:bg-white/[0.04]";
}

function getToneSoftClass(tone: OrderWorkflowTone) {
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

function getToneButtonClass(tone: OrderWorkflowTone) {
  if (tone === "sky") return "bg-sky-600";
  if (tone === "violet") return "bg-violet-600";
  if (tone === "rose") return "bg-rose-600";
  if (tone === "amber") return "bg-amber-600";
  if (tone === "emerald") return "bg-emerald-600";

  return "bg-slate-700";
}

function getToneBackgroundClass(tone: OrderWorkflowTone) {
  if (tone === "sky") return "bg-sky-500/[0.08] dark:bg-sky-400/[0.07]";
  if (tone === "violet") return "bg-violet-500/[0.08] dark:bg-violet-400/[0.07]";
  if (tone === "rose") return "bg-rose-500/[0.08] dark:bg-rose-400/[0.07]";
  if (tone === "amber") return "bg-amber-500/[0.10] dark:bg-amber-400/[0.07]";
  if (tone === "emerald") return "bg-emerald-500/[0.08] dark:bg-emerald-400/[0.07]";

  return "bg-white/55 dark:bg-white/[0.04]";
}

function getToneSubtlePanelClass(tone: OrderWorkflowTone) {
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
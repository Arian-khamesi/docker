"use client";

import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, PackageCheck } from "lucide-react";

import type {
  SalesOrder,
  SalesOrderKiyanInvoiceStatus,
  SalesOrderPaymentGateway,
  SalesOrderStatus,
} from "@/types/sales-order";
import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
import {
  getOperationalToneClass,
  type OperationalTone,
} from "@/lib/orders/order-operational-meta";

export function OperationalStatusTile({
  icon,
  title,
  value,
  description,
  tone,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
  tone: OperationalTone;
}) {
  const toneClass = getOperationalToneClass(tone);

  return (
    <div className="rounded-[1.45rem] bg-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:bg-white/[0.035] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-black text-muted-foreground">
          {title}
        </span>

        <div
          className={[
            "flex h-8 w-8 items-center justify-center rounded-2xl",
            toneClass.icon,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>

      <p className={["text-sm font-black", toneClass.text].join(" ")}>
        {value}
      </p>

      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function MiniOperationalBox({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-[1.1rem] bg-white/55 px-3 py-2 dark:bg-white/[0.05]">
      <p className="text-[10px] font-black text-muted-foreground">{label}</p>

      <p
        className={[
          "mt-1 truncate text-xs font-black",
          muted ? "text-muted-foreground" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

export function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black text-primary">{eyebrow}</p>

        <h2 className="mt-1 text-xl font-black text-foreground">{title}</h2>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function DetailStatCard({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-300"
      : tone === "danger"
        ? "bg-rose-500/[0.07] text-rose-700 dark:text-rose-300"
        : "bg-white/55 text-primary dark:bg-white/[0.04]";

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-muted-foreground">{label}</p>

          <p className="mt-2 truncate text-lg font-black text-foreground">
            {value}
          </p>

          <p className="mt-1 truncate text-xs font-bold text-muted-foreground">
            {hint}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function InfoTile({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-[1.35rem] bg-white/45 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:bg-white/[0.035]">
      <p className="text-[11px] font-black text-muted-foreground">{label}</p>

      <p
        className={[
          "mt-2 truncate text-sm font-black",
          muted ? "text-muted-foreground" : "text-foreground",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

export function SoftInfoCard({
  label,
  value,
  icon,
  copyValue,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  copyValue?: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:bg-white/[0.035]">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>

        <p className="text-xs font-black text-muted-foreground">{label}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-black text-foreground">{value}</p>

        {copyValue ? (
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(copyValue)}
            className="rounded-xl bg-black/[0.04] px-3 py-1.5 text-[11px] font-black text-muted-foreground transition hover:bg-primary/10 hover:text-primary dark:bg-white/[0.05]"
          >
            کپی
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ProductRow({
  product,
}: {
  product: SalesOrder["products"][number];
}) {
  return (
    <article className="rounded-[1.6rem] bg-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:bg-white/[0.035]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/70 shadow-sm dark:bg-white/[0.06]">
          {product.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary">
              <PackageCheck className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black text-foreground">
            {product.title}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <MiniPill label={`کد ${product.productCode}`} />
            <MiniPill label={product.color ?? "بدون رنگ"} />
            <MiniPill label={product.size ?? "بدون سایز"} />
            <MiniPill
              label={`تعداد ${product.quantity.toLocaleString("fa-IR")}`}
            />
          </div>

          <div
            className="mt-3 rounded-[1rem] bg-white/65 px-3 py-2 text-left text-xs font-black text-muted-foreground dark:bg-white/[0.05]"
            dir="ltr"
          >
            {product.barcode || "NO BARCODE"}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ChecklistItem({
  label,
  checked,
  warningLabel,
}: {
  label: string;
  checked: boolean;
  warningLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-white/45 px-3 py-3 dark:bg-white/[0.035]">
      <span className="text-xs font-black text-foreground">{label}</span>

      {checked ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          تایید
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          {warningLabel}
        </span>
      )}
    </div>
  );
}

export function MiniPill({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-black text-muted-foreground dark:bg-white/[0.05]">
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: SalesOrderStatus }) {
  const styles =
    status === "payment_success"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "payment_failed" || status === "cancelled"
        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
        : status === "payment_pending"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.06]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ${styles}`}
    >
      {status === "payment_success" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : status === "payment_failed" || status === "cancelled" ? (
        <AlertTriangle className="h-3.5 w-3.5" />
      ) : null}

      {getStatusLabel(status)}
    </span>
  );
}

export function GatewayBadge({ gateway }: { gateway: SalesOrderPaymentGateway }) {
  const styles =
    gateway === "snapp_pay"
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : gateway === "saman"
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : gateway === "mellat"
          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : gateway === "medisa"
            ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
            : gateway === "wallet"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.06]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${styles}`}>
      {getGatewayLabel(gateway)}
    </span>
  );
}

export function KiyanBadge({
  status,
}: {
  status: SalesOrderKiyanInvoiceStatus;
}) {
  if (status === "created") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
        ثبت شده
      </span>
    );
  }

  if (status === "not_required") {
    return (
      <span className="inline-flex items-center rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-black text-muted-foreground dark:bg-white/[0.06]">
        نیاز ندارد
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-300">
      ثبت نشده
    </span>
  );
}

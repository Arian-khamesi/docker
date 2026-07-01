import { PlusCircle } from "lucide-react";

import { OrdersWorkspaceShell } from "@/components/sales/orders/workspaces/orders-workspace-shell";

export default function CreateManualOrderPage() {
  return (
    <OrdersWorkspaceShell
      eyebrow="Create Manual Order"
      title="ثبت سفارش دستی"
      description="در این صفحه بعداً سفارش تلفنی، حضوری یا ثبت‌شده توسط ادمین ساخته می‌شود؛ شامل انتخاب مشتری، محصولات، پرداخت و اتصال به ثبت در کیان."
      icon={PlusCircle}
      tone="emerald"
      cards={[
        {
          label: "مرحله ۱",
          value: "مشتری",
          description: "انتخاب یا ثبت اطلاعات مشتری.",
        },
        {
          label: "مرحله ۲",
          value: "سبد",
          description: "انتخاب محصولات و تعداد.",
        },
        {
          label: "مرحله ۳",
          value: "پرداخت",
          description: "ثبت نوع پرداخت و مبلغ.",
        },
        {
          label: "مرحله ۴",
          value: "کیان",
          description: "آماده‌سازی برای ثبت فاکتور در کیان.",
        },
      ]}
    />
  );
}
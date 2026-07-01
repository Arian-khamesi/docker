import { BadgeDollarSign } from "lucide-react";

import { OrdersWorkspaceShell } from "@/components/sales/orders/workspaces/orders-workspace-shell";

export default function DirectKiyanSaleCreatePage() {
  return (
    <OrdersWorkspaceShell
      eyebrow="Kiyan Sale Workflow"
      title="ثبت فروش در کیان"
      description="مسیر مستقیم برای ثبت فروش در کیان. در فاز بعد، ابتدا سفارش انتخاب می‌شود و سپس payload ثبت فروش کیان از اطلاعات سفارش ساخته می‌شود."
      icon={BadgeDollarSign}
      tone="sky"
      cards={[
        {
          label: "مرحله ۱",
          value: "انتخاب سفارش",
          description: "اپراتور سفارش سایت یا سفارش دستی را انتخاب می‌کند.",
        },
        {
          label: "مرحله ۲",
          value: "بررسی اطلاعات",
          description: "مشتری، محصولات، مبلغ و پرداخت بررسی می‌شود.",
        },
        {
          label: "مرحله ۳",
          value: "Payload",
          description: "پیش‌نمایش payload کیان ساخته می‌شود.",
        },
        {
          label: "مرحله ۴",
          value: "ارسال",
          description: "درخواست ثبت فروش به کیان ارسال می‌شود.",
        },
      ]}
    />
  );
}
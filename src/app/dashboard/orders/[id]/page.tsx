"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { salesOrdersPageClass } from "@/components/sales/orders/sales-orders.constants";
import { OrderDetailCommandCenter } from "@/components/sales/orders/detail/order-detail-command-center";
import { OrderDetailTabbedLayout } from "@/components/sales/orders/detail/order-detail-tabbed-layout";
import { OrderNotFound } from "@/components/sales/orders/detail/order-detail-core-sections";
import { useSalesOrdersStore } from "@/store/sales-orders.store";

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const numericOrderId = Number(orderId);

  const orders = useSalesOrdersStore((state) => state.orders);

  const order = useMemo(
    () => orders.find((item) => item.id === numericOrderId),
    [orders, numericOrderId]
  );

  if (!order) {
    return <OrderNotFound orderId={orderId} />;
  }

  return (
    <main className={salesOrdersPageClass}>
      <OrderDetailCommandCenter order={order} />
      <OrderDetailTabbedLayout order={order} />
    </main>
  );
}
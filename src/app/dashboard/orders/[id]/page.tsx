"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { useSalesOrdersStore } from "@/store/sales-orders.store";
import { salesOrdersPageClass } from "@/components/sales/orders/sales-orders.constants";
import {
  CustomerSection,
  MissingKiyanAlert,
  OrderDetailHero,
  OrderDetailStats,
  OrderNotFound,
  OrderSnapshotSection,
  PaymentShippingGrid,
  ProductsSection,
  OrderWorkflowLinks
} from "@/components/sales/orders/detail/order-detail-core-sections";
import {
  OperationalOverview,
  OrderLifecycleDetails,
  OrderSidebar,
} from "@/components/sales/orders/detail/order-detail-operational-sections";

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { orders } = useSalesOrdersStore();

  const order = useMemo(
    () => orders.find((item) => String(item.id) === String(params.id)),
    [orders, params.id]
  );

  if (!order) {
    return <OrderNotFound orderId={params.id} />;
  }

  return (
    <div className={salesOrdersPageClass}>
      <OrderDetailHero order={order} />
      <MissingKiyanAlert order={order} />
      <OperationalOverview order={order} />
      <OrderDetailStats order={order} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-6">
          <OrderSnapshotSection order={order} />
          <CustomerSection order={order} />
          <ProductsSection order={order} />
          <PaymentShippingGrid order={order} />
          <OrderLifecycleDetails order={order} />
        </main>

        <OrderSidebar order={order} />
      </div>
    </div>
  );
}

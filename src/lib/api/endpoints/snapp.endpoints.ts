import { defineEndpoints } from "@/lib/api/endpoint.types";

export const snappEndpoints = defineEndpoints([
  {
    key: "snapp.getOrderReceiptDetail",
    method: "POST",
    path: "/snapp/orders/receipt-detail",
    auth: true,
    description: "Get SnappPay order receipt detail",
  },
  {
    key: "snapp.getProductDetail",
    method: "POST",
    path: "/snapp/products/detail",
    auth: true,
    description: "Get SnappPay product detail",
  },
  {
    key: "snapp.updateTransactionByAdmin",
    method: "POST",
    path: "/snapp/orders/update-transaction",
    auth: true,
    description: "Update SnappPay transaction by admin",
  },
] as const);
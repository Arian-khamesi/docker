import { defineEndpoints } from "@/lib/api/endpoint.types";

export const kiyanEndpoints = defineEndpoints([
  {
    key: "kiyan.sale.recovery",
    method: "POST",
    path: "/kiyan/sale/recovery",
    auth: true,
    description: "Register or recover Kiyan sale invoice for site order",
  },
  {
    key: "kiyan.customer.sync",
    method: "POST",
    path: "/kiyan/customers/sync",
    auth: true,
    description: "Sync customer with Kiyan",
  },
  {
    key: "kiyan.product.mapping",
    method: "POST",
    path: "/kiyan/products/mapping",
    auth: true,
    description: "Resolve product mapping with Kiyan",
  },
  {
    key: "kiyan.sale.existingInvoice",
    method: "POST",
    path: "/kiyan/sale/existing-invoice",
    auth: true,
    description: "Get existing Kiyan sale invoice",
  },
  {
    key: "kiyan.return.registerItems",
    method: "POST",
    path: "/kiyan/sale/return-items",
    auth: true,
    description: "Register Kiyan return items",
  },
  {
    key: "kiyan.return.receiptHeader",
    method: "GET",
    path: "/kiyan/sale/receipt-header",
    auth: true,
    description: "Get Kiyan receipt header by barcode",
  },
  {
    key: "kiyan.return.existingReturn",
    method: "POST",
    path: "/kiyan/sale/existing-return",
    auth: true,
    description: "Get existing Kiyan return document",
  },
] as const);
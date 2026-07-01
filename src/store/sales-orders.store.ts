import { create } from "zustand";

import type {
  SalesOrder,
  SalesOrderActionLog,
  SalesOrderActionType,
  SalesOrderDailySummary,
  SalesOrderExchangeInfo,
  SalesOrderExternalSyncStatus,
  SalesOrderKiyanDocument,
  SalesOrderOperatorNote,
  SalesOrderPaymentGateway,
  SalesOrderReturnInfo,
  SalesOrderStatus,
  SalesOrderType,
} from "@/types/sales-order";

interface SalesOrdersStore {
  orders: SalesOrder[];
  todaySummary: SalesOrderDailySummary;

  resetOrders: () => void;

  addOperatorNote: (orderId: number, message: string) => void;

  markOrderNeedsFollowUp: (
    orderId: number,
    needsFollowUp: boolean,
    reason?: string
  ) => void;

  updatePrimaryKiyanInvoice: (orderId: number, kiyanBarcode: string) => void;

  cancelPrimaryKiyanInvoice: (orderId: number, reason?: string) => void;

  registerReturnInfo: (
    orderId: number,
    returnInfo: SalesOrderReturnInfo
  ) => void;

  registerReturnKiyanBarcode: (
    orderId: number,
    returnKiyanBarcode: string
  ) => void;

  registerExchangeInfo: (
    orderId: number,
    exchangeInfo: SalesOrderExchangeInfo
  ) => void;

registerExchangeKiyanBarcode: (
  orderId: number,
  replacementKiyanBarcode: string,
  returnKiyanBarcode?: string
) => void;

  updateShippingTrackingCode: (orderId: number, trackingCode: string) => void;

  updateExternalSyncStatus: (
    orderId: number,
    status: SalesOrderExternalSyncStatus,
    failedReason?: string
  ) => void;
}

const initialTodaySummary: SalesOrderDailySummary = {
  ordersToday: 77,
  salesToday: 16_011_000,
  successfulPaymentsToday: 6,
  pendingOrFailedToday: 71,
  missingKiyanInvoiceToday: 0,
};

export const useSalesOrdersStore = create<SalesOrdersStore>((set) => ({
  orders: createMockOrders(),
  todaySummary: initialTodaySummary,

  resetOrders: () => {
    set({
      orders: createMockOrders(),
      todaySummary: initialTodaySummary,
    });
  },

  addOperatorNote: (orderId, message) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const note: SalesOrderOperatorNote = {
          id: createId("note"),
          message: trimmedMessage,
          createdAt: nowIso(),
          createdBy: "اپراتور",
        };

        return addLogToOrder(
          {
            ...order,
            operatorNotes: [note, ...(order.operatorNotes ?? [])],
          },
          createActionLog(
            "operator_note_added",
            "یادداشت اپراتور ثبت شد",
            trimmedMessage
          )
        );
      }),
    }));
  },

  markOrderNeedsFollowUp: (orderId, needsFollowUp, reason) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        return addLogToOrder(
          {
            ...order,
            needsFollowUp,
          },
          createActionLog(
            needsFollowUp ? "follow_up_marked" : "follow_up_resolved",
            needsFollowUp
              ? "سفارش نیازمند پیگیری شد"
              : "پیگیری سفارش رفع شد",
            reason
          )
        );
      }),
    }));
  },

  updatePrimaryKiyanInvoice: (orderId, kiyanBarcode) => {
    const trimmedBarcode = kiyanBarcode.trim();

    if (!trimmedBarcode) return;

    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const primaryDocument: SalesOrderKiyanDocument = {
          id: `kiyan_primary_${order.id}`,
          type: "primary",
          status: "registered",
          barcode: trimmedBarcode,
          relatedOrderId: order.id,
          createdAt: nowIso(),
          description: "فاکتور اصلی کیان ثبت شد",
        };

        return addLogToOrder(
          {
            ...order,
            accountingStatus: "registered",
            kiyanInvoice: {
              status: "created",
              code: trimmedBarcode,
            },
            kiyanDocuments: upsertKiyanDocument(
              order.kiyanDocuments,
              primaryDocument
            ),
          },
          createActionLog(
            "kiyan_primary_registered",
            "فاکتور اصلی کیان ثبت شد",
            trimmedBarcode
          )
        );
      }),
    }));
  },

  cancelPrimaryKiyanInvoice: (orderId, reason) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const primaryDocument: SalesOrderKiyanDocument = {
          id: `kiyan_primary_${order.id}`,
          type: "primary",
          status: "cancelled",
          barcode: order.kiyanInvoice.code,
          relatedOrderId: order.id,
          cancelledAt: nowIso(),
          description: reason ?? "فاکتور اصلی کیان کنسل شد",
        };

        return addLogToOrder(
          {
            ...order,
            accountingStatus: "cancelled",
            kiyanInvoice: {
              status: "missing",
              code: undefined,
            },
            kiyanDocuments: upsertKiyanDocument(
              order.kiyanDocuments,
              primaryDocument
            ),
          },
          createActionLog(
            "kiyan_cancelled",
            "فاکتور اصلی کیان کنسل شد",
            reason
          )
        );
      }),
    }));
  },

  registerReturnInfo: (orderId, returnInfo) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const isReturnCompleted =
          returnInfo.status === "completed" ||
          returnInfo.status === "kiyan_return_registered";

        return addLogToOrder(
          {
            ...order,
            returnInfo,
            accountingStatus:
              returnInfo.status === "kiyan_return_registered"
                ? "return_registered"
                : order.accountingStatus,
          },
          createActionLog(
            isReturnCompleted ? "return_completed" : "return_requested",
            isReturnCompleted
              ? "مرجوعی سفارش تکمیل شد"
              : "اطلاعات مرجوعی سفارش ثبت شد",
            returnInfo.reason
          )
        );
      }),
    }));
  },

  registerReturnKiyanBarcode: (orderId, returnKiyanBarcode) => {
    const trimmedBarcode = returnKiyanBarcode.trim();

    if (!trimmedBarcode) return;

    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const returnDocument: SalesOrderKiyanDocument = {
          id: `kiyan_return_${order.id}`,
          type: "return",
          status: "return_registered",
          barcode: trimmedBarcode,
          relatedOrderId: order.id,
          createdAt: nowIso(),
          description: "فاکتور مرجوعی کیان ثبت شد",
        };

        return addLogToOrder(
          {
            ...order,
            accountingStatus: "return_registered",
            returnInfo: {
              status: "kiyan_return_registered",
              returnKiyanBarcode: trimmedBarcode,
              reason: order.returnInfo?.reason,
              createdAt: order.returnInfo?.createdAt ?? nowIso(),
              completedAt: order.returnInfo?.completedAt,
              returnedProductIds: order.returnInfo?.returnedProductIds ?? [],
              returnedAmount: order.returnInfo?.returnedAmount,
            },
            kiyanDocuments: upsertKiyanDocument(
              order.kiyanDocuments,
              returnDocument
            ),
          },
          createActionLog(
            "kiyan_return_registered",
            "فاکتور مرجوعی کیان ثبت شد",
            trimmedBarcode
          )
        );
      }),
    }));
  },

  registerExchangeInfo: (orderId, exchangeInfo) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const isExchangeCompleted =
          exchangeInfo.status === "completed" ||
          exchangeInfo.status === "kiyan_exchange_registered";

        return addLogToOrder(
          {
            ...order,
            exchangeInfo,
            accountingStatus:
              exchangeInfo.status === "kiyan_exchange_registered"
                ? "exchange_registered"
                : order.accountingStatus,
            externalSync:
              order.payment.gateway === "snapp_pay"
                ? {
                    provider: "snapp_pay",
                    status: "pending",
                    shouldSyncAmount: true,
                    shouldSyncProducts: true,
                  }
                : order.externalSync,
          },
          createActionLog(
            isExchangeCompleted ? "exchange_completed" : "exchange_requested",
            isExchangeCompleted
              ? "تعویض سفارش تکمیل شد"
              : "اطلاعات تعویض سفارش ثبت شد",
            exchangeInfo.replacementOrderNumber
          )
        );
      }),
    }));
  },

registerExchangeKiyanBarcode: (
  orderId,
  replacementKiyanBarcode,
  returnKiyanBarcode
) =>
  set((state) => ({
    orders: state.orders.map((order) => {
      if (order.id !== orderId || !order.exchangeInfo) return order;

      const nextKiyanDocuments = [
        ...(order.kiyanDocuments ?? []).filter(
          (document) => document.type !== "exchange"
        ),
        {
          id: `kiyan-exchange-${orderId}-${Date.now()}`,
          type: "exchange" as const,
          status: "exchange_registered" as const,
          barcode: replacementKiyanBarcode,
          relatedOrderId: order.exchangeInfo.replacementOrderId,
          createdAt: new Date().toISOString(),
          description: "فاکتور فروش جایگزین تعویض در کیان ثبت شد.",
        },
      ];

      const nextDocumentsWithReturn = returnKiyanBarcode
        ? [
            ...nextKiyanDocuments.filter(
              (document) => document.type !== "return"
            ),
            {
              id: `kiyan-exchange-return-${orderId}-${Date.now()}`,
              type: "return" as const,
              status: "return_registered" as const,
              barcode: returnKiyanBarcode,
              relatedOrderId: order.id,
              createdAt: new Date().toISOString(),
              description: "سند برگشت کالاهای تعویضی در کیان ثبت شد.",
            },
          ]
        : nextKiyanDocuments;

      return {
        ...order,
        accountingStatus: "exchange_registered",
        kiyanDocuments: nextDocumentsWithReturn,
        exchangeInfo: {
          ...order.exchangeInfo,
          status: "kiyan_exchange_registered",
          returnKiyanBarcode:
            returnKiyanBarcode ?? order.exchangeInfo.returnKiyanBarcode,
          replacementKiyanBarcode,
        },
      };
    }),
  })),

  updateShippingTrackingCode: (orderId, trackingCode) => {
    const trimmedTrackingCode = trackingCode.trim();

    if (!trimmedTrackingCode) return;

    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        return addLogToOrder(
          {
            ...order,
            shipping: {
              ...order.shipping,
              trackingCode: trimmedTrackingCode,
            },
          },
          createActionLog(
            "shipping_tracking_updated",
            "کد رهگیری ارسال بروزرسانی شد",
            trimmedTrackingCode
          )
        );
      }),
    }));
  },

  updateExternalSyncStatus: (orderId, status, failedReason) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        return addLogToOrder(
          {
            ...order,
            externalSync: {
              provider:
                order.externalSync?.provider ??
                (order.payment.gateway === "snapp_pay" ? "snapp_pay" : "none"),
              status,
              failedReason,
              lastSyncedAt:
                status === "synced"
                  ? nowIso()
                  : order.externalSync?.lastSyncedAt,
              shouldSyncAmount: order.externalSync?.shouldSyncAmount,
              shouldSyncProducts: order.externalSync?.shouldSyncProducts,
            },
          },
          createActionLog(
            "external_sync_updated",
            "وضعیت سینک خارجی بروزرسانی شد",
            failedReason
          )
        );
      }),
    }));
  },
}));

function createMockOrders(): SalesOrder[] {
  const productImage =
    "https://jpa1981.com/public/images/products/10/1852/11/jpa_1781090573_8769174.webp";

  const cities = ["تهران", "محمديه", "کرج", "مشهد", "اصفهان", "شیراز"];

  const gateways: SalesOrderPaymentGateway[] = [
    "saman",
    "mellat",
    "snapp_pay",
    "medisa",
  ];

  const statuses: SalesOrderStatus[] = [
    "payment_failed",
    "payment_success",
    "payment_pending",
    "processing",
    "sent",
  ];

  const types: SalesOrderType[] = ["site", "medisa", "snapp_pay", "manual"];

  return Array.from({ length: 43 }, (_, index) => {
    const id = 26922 - index;
    const status = statuses[index % statuses.length]!;
    const gateway = gateways[index % gateways.length]!;
    const type = types[index % types.length]!;
    const isSuccess = status === "payment_success";
    const amount = 1_250_000 + index * 110_000;
    const hasKiyanInvoice = isSuccess && index % 6 !== 0;
    const kiyanCode = hasKiyanInvoice ? `KY-${id}` : undefined;
    const needsFollowUp = index % 7 === 0;

    const primaryKiyanDocument: SalesOrderKiyanDocument | undefined =
      hasKiyanInvoice
        ? {
            id: `kiyan_primary_${id}`,
            type: "primary",
            status: "registered",
            barcode: kiyanCode,
            relatedOrderId: id,
            createdAt: new Date().toISOString(),
            description: "فاکتور اصلی کیان ثبت شده است",
          }
        : undefined;

    return {
      id,
      externalOrderId: `EXT-${id}`,
      medisaCode: type === "medisa" ? `MD-${14000 + index}` : undefined,

      createdAt: new Date().toISOString(),
      gregorianDate: new Date().toISOString().slice(0, 10),
      displayDate: `1405/4/6 · ${String(15 + (index % 7)).padStart(
        2,
        "0"
      )}:${String(20 + (index % 30)).padStart(2, "0")}:03`,

      status,
      type,

      customer: {
        fullName: index % 4 === 0 ? "کاربر جدید" : `مشتری ${index + 1}`,
        mobile: `0910${String(6773497 + index).slice(0, 7)}`,
        city: cities[index % cities.length]!,
        province: "تهران",
      },

      payment: {
        gateway,
        statusCode: isSuccess ? 100 : status === "payment_pending" ? 50 : 0,
        paidAmount: isSuccess ? amount : 0,
        paidAt: isSuccess ? new Date().toISOString() : undefined,
        trackingCode: isSuccess ? `TR-${id}` : undefined,
      },

      shipping: {
        method: index % 3 === 0 ? "تیپاکس" : index % 3 === 1 ? "پست" : "پیک",
        trackingCode: index % 5 === 0 ? undefined : `SHIP-${id}`,
      },

      kiyanInvoice: {
        status: hasKiyanInvoice ? "created" : "missing",
        code: kiyanCode,
      },

      products: [
        {
          id: `product-${id}-1`,
          title:
            index % 2 === 0
              ? "شلوارک کمرکش کد 04468"
              : "تیشرت مردانه کد 03120",
          productCode: index % 2 === 0 ? "04468" : "03120",
          barcode: index % 2 === 0 ? "704103051004468" : `70410305100${id}`,
          color: index % 2 === 0 ? "سبز تیره" : "مشکی",
          size: index % 2 === 0 ? "XL" : "L",
          quantity: index % 4 === 0 ? 2 : 1,
          thumbnailUrl: productImage,
        },
      ],

      totalAmount: amount,
      payableAmount: amount,
      paidAmount: isSuccess ? amount : 0,

      notes: needsFollowUp ? "نیازمند بررسی پرداخت" : undefined,

      accountingStatus: hasKiyanInvoice ? "registered" : "not_registered",
      needsFollowUp,
      kiyanDocuments: primaryKiyanDocument ? [primaryKiyanDocument] : [],
      returnInfo: {
        status: "none",
        returnedProductIds: [],
      },
      exchangeInfo: {
        status: "none",
        originalOrderId: id,
        returnedProductIds: [],
        replacementProducts: [],
        amountDirection: "equal",
        amountDifference: 0,
      },
      externalSync:
        gateway === "snapp_pay"
          ? {
              provider: "snapp_pay",
              status: "not_required",
              shouldSyncAmount: false,
              shouldSyncProducts: false,
            }
          : {
              provider: "none",
              status: "not_required",
              shouldSyncAmount: false,
              shouldSyncProducts: false,
            },
      operatorNotes: needsFollowUp
        ? [
            {
              id: `note_initial_${id}`,
              message: "این سفارش نیازمند بررسی اولیه است.",
              createdAt: new Date().toISOString(),
              createdBy: "سیستم",
            },
          ]
        : [],
      actionLogs: [],
    };
  });
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createActionLog(
  type: SalesOrderActionType,
  title: string,
  description?: string
): SalesOrderActionLog {
  return {
    id: createId("log"),
    type,
    title,
    description,
    createdAt: nowIso(),
    createdBy: "اپراتور",
  };
}

function addLogToOrder(
  order: SalesOrder,
  log: SalesOrderActionLog
): SalesOrder {
  return {
    ...order,
    actionLogs: [log, ...(order.actionLogs ?? [])],
  };
}

function upsertKiyanDocument(
  documents: SalesOrderKiyanDocument[] | undefined,
  document: SalesOrderKiyanDocument
): SalesOrderKiyanDocument[] {
  const currentDocuments = documents ?? [];
  const exists = currentDocuments.some((item) => item.id === document.id);

  if (!exists) {
    return [document, ...currentDocuments];
  }

  return currentDocuments.map((item) =>
    item.id === document.id ? document : item
  );
}
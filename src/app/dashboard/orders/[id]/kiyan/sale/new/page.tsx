// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "next/navigation";
// import type { LucideIcon } from "lucide-react";
// import {
//   AlertTriangle,
//   ArrowLeft,
//   ArrowRight,
//   BadgeDollarSign,
//   CheckCircle2,
//   CircleDollarSign,
//   CreditCard,
//   FileJson,
//   PackageCheck,
//   Plus,
//   ReceiptText,
//   Save,
//   Trash2,
//   UserRound,
// } from "lucide-react";

// import { getSalesOrderDetailPath } from "@/components/sales/orders/sales-orders.constants";
// import { getGatewayLabel, getStatusLabel } from "@/lib/orders/order-labels";
// import { useSalesOrdersStore } from "@/store/sales-orders.store";
// import type { SalesOrder, SalesOrderProduct } from "@/types/sales-order";

// type RequestState = "idle" | "sending" | "success" | "failed";
// type DiscountType = "percent" | "amount";

// interface KiyanSalePayload {
//   uniqueInfo: string;
//   customerId: string;
//   saleTransactionItemInformation: {
//     itemId: number;
//     quantity: number;
//     price: number;
//     priceWithDiscount: number;
//     tax: number;
//     charge: number;
//     workerId: number;
//     isCancel: boolean;
//   }[];
//   paymentInformation: {
//     tenderId: string;
//     paymentAmount: number;
//     discountedAmount: number;
//     rrn: string;
//     stan: string;
//     cardNumber: string;
//     hashedCardNumber: string;
//     customerIdentifier: string;
//     terminalCode: string;
//     serialNumber: string;
//     giftCardPassword: string;
//   }[];
// }

// interface KiyanSaleItemDraft {
//   productId: string;
//   itemId: string;
//   quantity: string;
//   price: string;
//   priceWithDiscount: string;
// }

// interface KiyanPaymentDraft {
//   id: string;
//   tenderId: string;
//   amount: string;
//   serialNumber: string;
//   confirmed: boolean;
//   locked?: boolean;
//   label?: string;
// }

// interface MockKiyanSaleResponse {
//   success: boolean;
//   saleReceiptBarcode: string;
//   message: string;
//   createdAt: string;
//   rawResponse: {
//     saleReceiptBarcode: string;
//   };
// }

// const KIYAN_DISCOUNT_PERCENT = "125";
// const KIYAN_DISCOUNT_AMOUNT = "126";

// const KIYAN_GATEWAYS = [
//   { id: "1", title: "نقد" },
//   { id: "621", title: "سامان" },
//   { id: "1247", title: "مدیسه" },
//   { id: "1015", title: "اسنپ" },
//   { id: "399", title: "اعتبار" },
// ];

// export default function KiyanSaleCreateForOrderPage() {
//   const params = useParams<{ id: string }>();

//   const { orders, updatePrimaryKiyanInvoice, markOrderNeedsFollowUp } =
//     useSalesOrdersStore();

//   const order = useMemo(
//     () => orders.find((item) => String(item.id) === String(params.id)),
//     [orders, params.id]
//   );

//   const [hydratedOrderId, setHydratedOrderId] = useState<string | null>(null);
//   const [kiyanCustomerId, setKiyanCustomerId] = useState("");
//   const [itemDrafts, setItemDrafts] = useState<KiyanSaleItemDraft[]>([]);
//   const [paymentDrafts, setPaymentDrafts] = useState<KiyanPaymentDraft[]>([]);
//   const [newTenderId, setNewTenderId] = useState("621");
//   const [newPaymentAmount, setNewPaymentAmount] = useState("");
//   const [discountType, setDiscountType] = useState<DiscountType>("percent");
//   const [discountValue, setDiscountValue] = useState("");
//   const [discountBarcode, setDiscountBarcode] = useState("");
//   const [requestState, setRequestState] = useState<RequestState>("idle");
//   const [mockResponse, setMockResponse] = useState<MockKiyanSaleResponse | null>(
//     null
//   );
//   const [submitError, setSubmitError] = useState("");

//   useEffect(() => {
//     if (!order || hydratedOrderId === String(order.id)) return;

//     setKiyanCustomerId(buildMockKiyanCustomerId(order));
//     setItemDrafts(buildInitialSaleItemDrafts(order));
//     setPaymentDrafts([
//       {
//         id: createDraftId(),
//         tenderId: resolveKiyanTenderId(order),
//         amount: String(order.payableAmount || order.paidAmount || 0),
//         serialNumber: "",
//         confirmed: true,
//         label: getGatewayLabel(order.payment.gateway),
//       },
//     ]);

//     setHydratedOrderId(String(order.id));
//   }, [hydratedOrderId, order]);

//   const confirmedPayments = useMemo(
//     () => paymentDrafts.filter((payment) => payment.confirmed),
//     [paymentDrafts]
//   );

//   const confirmedPaymentTotal = useMemo(
//     () =>
//       confirmedPayments.reduce(
//         (total, payment) => total + parseMoney(payment.amount),
//         0
//       ),
//     [confirmedPayments]
//   );

//   const targetAmount = order?.payableAmount ?? 0;
//   const paymentDiff = targetAmount - confirmedPaymentTotal;

//   const discountAmount = useMemo(() => {
//     if (!order) return 0;

//     const value = parseMoney(discountValue);

//     if (value <= 0) return 0;

//     if (discountType === "percent") {
//       return Math.round((targetAmount * value) / 100);
//     }

//     return value;
//   }, [discountType, discountValue, order, targetAmount]);

//   const payload = useMemo(() => {
//     if (!order) return null;

//     return buildRealKiyanSalePayload(order, {
//       kiyanCustomerId,
//       itemDrafts,
//       paymentDrafts: confirmedPayments,
//     });
//   }, [confirmedPayments, itemDrafts, kiyanCustomerId, order]);

//   const validationError = useMemo(() => {
//     if (!order) return "سفارش معتبر نیست.";

//     return validateKiyanSalePayload({
//       order,
//       kiyanCustomerId,
//       itemDrafts,
//       paymentDrafts,
//       targetAmount,
//       confirmedPaymentTotal,
//     });
//   }, [
//     confirmedPaymentTotal,
//     itemDrafts,
//     kiyanCustomerId,
//     order,
//     paymentDrafts,
//     targetAmount,
//   ]);

//   const canSend =
//     Boolean(order) &&
//     Boolean(payload) &&
//     !validationError &&
//     requestState !== "sending";

//   function updateItemDraft(
//     productId: string,
//     field: keyof Omit<KiyanSaleItemDraft, "productId">,
//     value: string
//   ) {
//     setItemDrafts((current) =>
//       current.map((item) =>
//         item.productId === productId
//           ? {
//               ...item,
//               [field]: value,
//             }
//           : item
//       )
//     );
//   }

//   function addPaymentRow() {
//     const amount = parseMoney(newPaymentAmount);

//     if (!newTenderId || amount <= 0) {
//       setSubmitError("درگاه و مبلغ پرداخت را درست وارد کن.");
//       return;
//     }

//     setPaymentDrafts((current) => [
//       ...current,
//       {
//         id: createDraftId(),
//         tenderId: newTenderId,
//         amount: String(amount),
//         serialNumber: "",
//         confirmed: false,
//       },
//     ]);

//     setNewPaymentAmount("");
//     setSubmitError("");
//   }

//   function updatePaymentRow(
//     id: string,
//     field: keyof Pick<KiyanPaymentDraft, "tenderId" | "amount" | "serialNumber">,
//     value: string
//   ) {
//     setPaymentDrafts((current) =>
//       current.map((payment) =>
//         payment.id === id
//           ? {
//               ...payment,
//               [field]: value,
//             }
//           : payment
//       )
//     );
//   }

//   function confirmPaymentRow(id: string) {
//     setPaymentDrafts((current) =>
//       current.map((payment) =>
//         payment.id === id
//           ? {
//               ...payment,
//               confirmed: true,
//             }
//           : payment
//       )
//     );
//   }

//   function editPaymentRow(id: string) {
//     setPaymentDrafts((current) =>
//       current.map((payment) =>
//         payment.id === id && !payment.locked
//           ? {
//               ...payment,
//               confirmed: false,
//             }
//           : payment
//       )
//     );
//   }

//   function removePaymentRow(id: string) {
//     setPaymentDrafts((current) =>
//       current.filter((payment) => payment.id !== id)
//     );
//   }

//   function applyDiscount() {
//     if (!order) return;

//     const value = parseMoney(discountValue);

//     if (!discountBarcode.trim()) {
//       setSubmitError("برای تخفیف، بارکد یا سریال تخفیف را وارد کن.");
//       return;
//     }

//     if (value <= 0) {
//       setSubmitError("مقدار تخفیف معتبر نیست.");
//       return;
//     }

//     if (discountAmount <= 0 || discountAmount >= targetAmount) {
//       setSubmitError("مبلغ تخفیف نمی‌تواند برابر یا بیشتر از مبلغ سفارش باشد.");
//       return;
//     }

//     const tenderId =
//       discountType === "percent"
//         ? KIYAN_DISCOUNT_PERCENT
//         : KIYAN_DISCOUNT_AMOUNT;

//     const label =
//       discountType === "percent" ? "تخفیف درصدی" : "بن ریالی / تخفیف مبلغی";

//     setPaymentDrafts((current) => {
//       const withoutPreviousDiscount = current.filter(
//         (payment) =>
//           payment.tenderId !== KIYAN_DISCOUNT_PERCENT &&
//           payment.tenderId !== KIYAN_DISCOUNT_AMOUNT
//       );

//       return [
//         ...withoutPreviousDiscount,
//         {
//           id: createDraftId(),
//           tenderId,
//           amount: String(discountAmount),
//           serialNumber: discountBarcode.trim(),
//           confirmed: true,
//           locked: true,
//           label,
//         },
//       ];
//     });

//     setSubmitError("");
//   }

//   async function handleMockSend() {
//     if (!order || !payload) return;

//     setSubmitError(validationError);

//     if (validationError) return;

//     setRequestState("sending");
//     setMockResponse(null);

//     await new Promise((resolve) => setTimeout(resolve, 850));

//     const saleReceiptBarcode = `KY-SALE-${order.id}-${Date.now()
//       .toString()
//       .slice(-6)}`;

//     const response: MockKiyanSaleResponse = {
//       success: true,
//       saleReceiptBarcode,
//       message: "فاکتور فروش با موفقیت در کیان ثبت شد.",
//       createdAt: new Date().toISOString(),
//       rawResponse: {
//         saleReceiptBarcode,
//       },
//     };

//     updatePrimaryKiyanInvoice(order.id, saleReceiptBarcode);

//     markOrderNeedsFollowUp(
//       order.id,
//       false,
//       "فاکتور فروش کیان با payload واقعی‌تر ثبت شد."
//     );

//     setMockResponse(response);
//     setRequestState("success");
//   }

//   if (!order) {
//     return (
//       <main className="glass-page min-h-screen p-4 sm:p-6 lg:p-8">
//         <section className="glass-panel mx-auto max-w-2xl p-6 text-center">
//           <h1 className="text-xl font-black text-foreground">
//             سفارش پیدا نشد
//           </h1>

//           <p className="mt-2 text-sm text-muted-foreground">
//             برای ثبت فروش در کیان، ابتدا باید سفارش معتبر انتخاب شود.
//           </p>

//           <Link
//             href="/dashboard/orders"
//             className="mt-5 inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground"
//           >
//             بازگشت به سفارشات
//           </Link>
//         </section>
//       </main>
//     );
//   }

//   const isAlreadyRegistered = order.kiyanInvoice.status === "created";

//   return (
//     <main className="glass-page min-h-screen p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto grid max-w-7xl gap-6">
//         <section className="relative overflow-hidden rounded-[2.2rem] bg-white/55 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl dark:bg-white/[0.04] dark:shadow-[0_18px_55px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
//           <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
//           <div className="pointer-events-none absolute right-20 top-0 h-px w-72 bg-gradient-to-l from-transparent via-white/70 to-transparent dark:via-white/10" />

//           <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
//             <div className="flex items-start gap-3">
//               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
//                 <BadgeDollarSign className="h-6 w-6" />
//               </div>

//               <div>
//                 <p className="text-xs font-black text-sky-700 dark:text-sky-300">
//                   Real Kiyan Sale Payload
//                 </p>

//                 <h1 className="mt-1 text-2xl font-black text-foreground">
//                   ثبت فروش سفارش #{order.id} در کیان
//                 </h1>

//                 <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
//                   در این نسخه payload ثبت فروش مطابق ساختار واقعی‌تر کیان ساخته
//                   می‌شود: اطلاعات مشتری کیان، آیتم‌های فروش و اطلاعات پرداخت.
//                 </p>
//               </div>
//             </div>

//             <Link
//               href={getSalesOrderDetailPath(order.id)}
//               className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/65 px-4 py-2 text-sm font-black text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition hover:-translate-y-0.5 dark:bg-white/[0.06]"
//             >
//               <ArrowRight className="h-4 w-4" />
//               بازگشت به جزئیات سفارش
//             </Link>
//           </div>

//           {isAlreadyRegistered ? (
//             <div className="relative mt-5 rounded-[1.5rem] bg-emerald-500/10 px-4 py-3 text-sm font-bold leading-7 text-emerald-700 dark:text-emerald-300">
//               این سفارش قبلاً در کیان ثبت شده است. کد فعلی:{" "}
//               <span dir="ltr" className="font-black">
//                 {order.kiyanInvoice.code}
//               </span>
//             </div>
//           ) : null}
//         </section>

//         <section className="grid gap-4 lg:grid-cols-[1fr_390px]">
//           <div className="grid gap-4">
//             <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
//               <SectionTitle
//                 icon={UserRound}
//                 eyebrow="Customer"
//                 title="شناسه مشتری کیان"
//               />

//               <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
//                 <KiyanInput
//                   label="customerId کیان"
//                   value={kiyanCustomerId}
//                   onChange={setKiyanCustomerId}
//                   placeholder="شناسه مشتری در کیان"
//                   dir="ltr"
//                 />

//                 <ReadOnlyBox
//                   label="uniqueInfo"
//                   value={`${order.id}-${kiyanCustomerId || "customerId"}`}
//                 />
//               </div>

//               <p className="mt-3 rounded-[1.3rem] bg-sky-500/10 px-4 py-3 text-xs font-bold leading-6 text-sky-700 dark:text-sky-300">
//                 در اتصال واقعی، customerId باید از سرویس آماده‌سازی سفارش یا
//                 دیتای مشتری کیان گرفته شود. فعلاً مقدار mock قابل ویرایش است.
//               </p>
//             </section>

//             <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
//               <SectionTitle
//                 icon={PackageCheck}
//                 eyebrow="Sale Items"
//                 title="saleTransactionItemInformation"
//               />

//               <div className="mt-4 grid gap-3">
//                 {itemDrafts.map((draft) => {
//                   const product = order.products.find(
//                     (item) => item.id === draft.productId
//                   );

//                   if (!product) return null;

//                   return (
//                     <article
//                       key={draft.productId}
//                       className="rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04]"
//                     >
//                       <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
//                         <div className="flex min-w-0 flex-1 items-center gap-3">
//                           <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/70 dark:bg-white/[0.06]">
//                             {product.thumbnailUrl ? (
//                               // eslint-disable-next-line @next/next/no-img-element
//                               <img
//                                 src={product.thumbnailUrl}
//                                 alt={product.title}
//                                 className="h-full w-full object-cover"
//                               />
//                             ) : null}
//                           </div>

//                           <div className="min-w-0">
//                             <p className="truncate text-sm font-black text-foreground">
//                               {product.title}
//                             </p>

//                             <p className="mt-1 text-xs font-bold text-muted-foreground">
//                               کد {product.productCode} · {product.color ?? "-"}{" "}
//                               · {product.size ?? "-"} · تعداد سفارش{" "}
//                               {product.quantity.toLocaleString("fa-IR")}
//                             </p>

//                             <p
//                               dir="ltr"
//                               className="mt-1 text-left text-[11px] font-bold text-muted-foreground"
//                             >
//                               {product.barcode}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="grid gap-2 md:grid-cols-4 xl:w-[620px]">
//                           <KiyanInput
//                             label="itemId کیان"
//                             value={draft.itemId}
//                             onChange={(value) =>
//                               updateItemDraft(
//                                 draft.productId,
//                                 "itemId",
//                                 value
//                               )
//                             }
//                             placeholder="itemId"
//                             dir="ltr"
//                             inputMode="numeric"
//                           />

//                           <KiyanInput
//                             label="quantity"
//                             value={draft.quantity}
//                             onChange={(value) =>
//                               updateItemDraft(
//                                 draft.productId,
//                                 "quantity",
//                                 value
//                               )
//                             }
//                             placeholder="1"
//                             dir="ltr"
//                             inputMode="numeric"
//                           />

//                           <KiyanInput
//                             label="price"
//                             value={draft.price}
//                             onChange={(value) =>
//                               updateItemDraft(draft.productId, "price", value)
//                             }
//                             placeholder="price"
//                             dir="ltr"
//                             inputMode="numeric"
//                           />

//                           <KiyanInput
//                             label="priceWithDiscount"
//                             value={draft.priceWithDiscount}
//                             onChange={(value) =>
//                               updateItemDraft(
//                                 draft.productId,
//                                 "priceWithDiscount",
//                                 value
//                               )
//                             }
//                             placeholder="priceWithDiscount"
//                             dir="ltr"
//                             inputMode="numeric"
//                           />
//                         </div>
//                       </div>
//                     </article>
//                   );
//                 })}
//               </div>
//             </section>

//             <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
//               <SectionTitle
//                 icon={CreditCard}
//                 eyebrow="Payment Information"
//                 title="درگاه‌ها و پرداخت‌های کیان"
//               />

//               <div className="mt-4 grid gap-3 rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04] md:grid-cols-[1fr_1fr_auto]">
//                 <div>
//                   <label className="text-xs font-black text-muted-foreground">
//                     درگاه
//                   </label>

//                   <select
//                     value={newTenderId}
//                     onChange={(event) => setNewTenderId(event.target.value)}
//                     className="mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
//                   >
//                     {KIYAN_GATEWAYS.map((gateway) => (
//                       <option key={gateway.id} value={gateway.id}>
//                         {gateway.title}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <KiyanInput
//                   label="مبلغ پرداخت - تومان"
//                   value={newPaymentAmount}
//                   onChange={setNewPaymentAmount}
//                   placeholder="مثلاً 1500000"
//                   dir="ltr"
//                   inputMode="numeric"
//                 />

//                 <button
//                   type="button"
//                   onClick={addPaymentRow}
//                   className="mt-auto flex h-12 items-center justify-center gap-2 rounded-[1.4rem] bg-sky-600 px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(2,132,199,0.18)] transition hover:-translate-y-0.5"
//                 >
//                   <Plus className="h-4 w-4" />
//                   افزودن
//                 </button>
//               </div>

//               <div className="mt-3 grid gap-3">
//                 {paymentDrafts.map((payment) => (
//                   <PaymentRow
//                     key={payment.id}
//                     payment={payment}
//                     onChange={updatePaymentRow}
//                     onConfirm={confirmPaymentRow}
//                     onEdit={editPaymentRow}
//                     onRemove={removePaymentRow}
//                   />
//                 ))}
//               </div>
//             </section>

//             <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
//               <SectionTitle
//                 icon={ReceiptText}
//                 eyebrow="Discount Tender"
//                 title="اعمال تخفیف کیان"
//               />

//               <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_1fr_auto]">
//                 <div>
//                   <label className="text-xs font-black text-muted-foreground">
//                     نوع تخفیف
//                   </label>

//                   <select
//                     value={discountType}
//                     onChange={(event) =>
//                       setDiscountType(event.target.value as DiscountType)
//                     }
//                     className="mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none dark:bg-white/[0.05]"
//                   >
//                     <option value="percent">درصدی</option>
//                     <option value="amount">ریالی / مبلغی</option>
//                   </select>
//                 </div>

//                 <KiyanInput
//                   label="مقدار تخفیف"
//                   value={discountValue}
//                   onChange={setDiscountValue}
//                   placeholder={
//                     discountType === "percent" ? "مثلاً 10" : "مثلاً 200000"
//                   }
//                   dir="ltr"
//                   inputMode="numeric"
//                 />

//                 <KiyanInput
//                   label="بارکد / سریال تخفیف"
//                   value={discountBarcode}
//                   onChange={setDiscountBarcode}
//                   placeholder="serialNumber"
//                   dir="ltr"
//                 />

//                 <button
//                   type="button"
//                   onClick={applyDiscount}
//                   className="mt-auto flex h-12 items-center justify-center gap-2 rounded-[1.4rem] bg-violet-600 px-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(124,58,237,0.18)] transition hover:-translate-y-0.5"
//                 >
//                   اعمال
//                 </button>
//               </div>

//               <p className="mt-3 rounded-[1.3rem] bg-violet-500/10 px-4 py-3 text-xs font-bold leading-6 text-violet-700 dark:text-violet-300">
//                 مبلغ تخفیف محاسبه‌شده:{" "}
//                 <span className="font-black">
//                   {discountAmount.toLocaleString("fa-IR")} تومان
//                 </span>
//                 . این مقدار به عنوان paymentInformation با tenderId مخصوص تخفیف
//                 وارد payload می‌شود.
//               </p>
//             </section>

//             <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
//               <SectionTitle
//                 icon={FileJson}
//                 eyebrow="Payload Preview"
//                 title="پیش‌نمایش payload واقعی‌تر ثبت فروش کیان"
//               />

//               <pre
//                 dir="ltr"
//                 className="mt-4 max-h-[520px] overflow-auto rounded-[1.5rem] bg-slate-950/95 p-4 text-left text-xs leading-6 text-slate-100"
//               >
//                 {payload
//                   ? JSON.stringify(payload, null, 2)
//                   : JSON.stringify(
//                       {
//                         message:
//                           "برای ساخت payload، customerId، آیتم‌ها و پرداخت‌ها باید کامل باشند.",
//                       },
//                       null,
//                       2
//                     )}
//               </pre>
//             </section>
//           </div>

//           <aside className="space-y-4">
//             <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
//               <h2 className="text-base font-black text-foreground">
//                 خلاصه سفارش
//               </h2>

//               <div className="mt-4 grid gap-2">
//                 <InfoRow label="مشتری" value={order.customer.fullName} />
//                 <InfoRow label="موبایل" value={order.customer.mobile} />
//                 <InfoRow label="وضعیت" value={getStatusLabel(order.status)} />
//                 <InfoRow
//                   label="درگاه اصلی"
//                   value={getGatewayLabel(order.payment.gateway)}
//                 />
//                 <InfoRow
//                   label="مبلغ سفارش"
//                   value={`${order.payableAmount.toLocaleString(
//                     "fa-IR"
//                   )} تومان`}
//                 />
//                 <InfoRow
//                   label="کیان"
//                   value={
//                     order.kiyanInvoice.status === "created"
//                       ? order.kiyanInvoice.code || "ثبت شده"
//                       : "ثبت نشده"
//                   }
//                 />
//               </div>
//             </section>

//             <section className="rounded-[2rem] bg-sky-500/[0.07] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-sky-400/[0.08]">
//               <h2 className="text-base font-black text-foreground">
//                 کنترل مبلغ پرداخت
//               </h2>

//               <div className="mt-4 grid gap-2">
//                 <InfoRow
//                   label="مبلغ هدف"
//                   value={`${targetAmount.toLocaleString("fa-IR")} تومان`}
//                 />

//                 <InfoRow
//                   label="جمع پرداخت‌های تاییدشده"
//                   value={`${confirmedPaymentTotal.toLocaleString(
//                     "fa-IR"
//                   )} تومان`}
//                 />

//                 <InfoRow
//                   label="اختلاف"
//                   value={`${paymentDiff.toLocaleString("fa-IR")} تومان`}
//                 />
//               </div>

//               {paymentDiff === 0 ? (
//                 <p className="mt-3 rounded-[1.3rem] bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-700 dark:text-emerald-300">
//                   جمع پرداخت‌ها با مبلغ سفارش برابر است.
//                 </p>
//               ) : (
//                 <p className="mt-3 rounded-[1.3rem] bg-rose-500/10 px-4 py-3 text-xs font-black text-rose-700 dark:text-rose-300">
//                   جمع پرداخت‌ها باید دقیقاً با مبلغ سفارش برابر شود.
//                 </p>
//               )}
//             </section>

//             <section className="rounded-[2rem] bg-white/55 p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-white/[0.04]">
//               <h2 className="text-base font-black text-foreground">
//                 آمادگی ارسال
//               </h2>

//               <div className="mt-4 grid gap-2">
//                 <ReadyLine
//                   active={Number(kiyanCustomerId) > 0}
//                   label="customerId کیان"
//                 />
//                 <ReadyLine
//                   active={itemDrafts.length > 0}
//                   label="آیتم‌های سفارش"
//                 />
//                 <ReadyLine
//                   active={itemDrafts.every((item) => Number(item.itemId) > 0)}
//                   label="itemIdهای کیان"
//                 />
//                 <ReadyLine
//                   active={confirmedPayments.length > 0}
//                   label="پرداخت تاییدشده"
//                 />
//                 <ReadyLine active={paymentDiff === 0} label="تراز پرداخت" />
//                 <ReadyLine active={!validationError} label="payload معتبر" />
//               </div>
//             </section>

//             {submitError || validationError ? (
//               <p className="rounded-[1.5rem] bg-rose-500/10 px-4 py-3 text-xs font-black leading-6 text-rose-700 dark:text-rose-300">
//                 {submitError || validationError}
//               </p>
//             ) : null}

//             <button
//               type="button"
//               disabled={!canSend}
//               onClick={handleMockSend}
//               className={[
//                 "flex w-full items-center justify-center gap-2 rounded-[1.6rem] px-4 py-3 text-sm font-black transition",
//                 canSend
//                   ? "bg-sky-600 text-white shadow-[0_14px_32px_rgba(2,132,199,0.20)] hover:-translate-y-0.5"
//                   : "cursor-not-allowed bg-muted text-muted-foreground",
//               ].join(" ")}
//             >
//               {requestState === "sending" ? (
//                 <>
//                   <Save className="h-4 w-4 animate-pulse" />
//                   در حال ارسال mock...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   ارسال mock ثبت فروش کیان
//                 </>
//               )}
//             </button>

//             {mockResponse ? (
//               <section className="rounded-[2rem] bg-emerald-500/[0.08] p-4 shadow-[0_14px_38px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl dark:bg-emerald-400/[0.08]">
//                 <div className="flex items-start gap-3">
//                   <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700 dark:text-emerald-300" />

//                   <div className="min-w-0">
//                     <h2 className="text-base font-black text-foreground">
//                       پاسخ mock کیان
//                     </h2>

//                     <div className="mt-3 grid gap-2">
//                       <InfoRow label="نتیجه" value="موفق" />
//                       <InfoRow
//                         label="بارکد فاکتور فروش"
//                         value={mockResponse.saleReceiptBarcode}
//                       />
//                     </div>

//                     <pre
//                       dir="ltr"
//                       className="mt-3 max-h-40 overflow-auto rounded-[1.2rem] bg-slate-950/95 p-3 text-left text-xs leading-6 text-slate-100"
//                     >
//                       {JSON.stringify(mockResponse.rawResponse, null, 2)}
//                     </pre>

//                     <p className="mt-3 text-xs leading-6 text-muted-foreground">
//                       {mockResponse.message}
//                     </p>

//                     <Link
//                       href={getSalesOrderDetailPath(order.id)}
//                       className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:-translate-y-0.5"
//                     >
//                       بازگشت به جزئیات سفارش
//                       <ArrowLeft className="h-4 w-4" />
//                     </Link>
//                   </div>
//                 </div>
//               </section>
//             ) : null}
//           </aside>
//         </section>
//       </div>
//     </main>
//   );
// }

// function PaymentRow({
//   payment,
//   onChange,
//   onConfirm,
//   onEdit,
//   onRemove,
// }: {
//   payment: KiyanPaymentDraft;
//   onChange: (
//     id: string,
//     field: keyof Pick<KiyanPaymentDraft, "tenderId" | "amount" | "serialNumber">,
//     value: string
//   ) => void;
//   onConfirm: (id: string) => void;
//   onEdit: (id: string) => void;
//   onRemove: (id: string) => void;
// }) {
//   const readonly = payment.confirmed || payment.locked;
//   const tenderTitle = getTenderTitle(payment.tenderId);

//   return (
//     <article className="rounded-[1.6rem] bg-white/45 p-3 dark:bg-white/[0.04]">
//       <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
//         <div>
//           <label className="text-xs font-black text-muted-foreground">
//             tenderId
//           </label>

//           <select
//             value={payment.tenderId}
//             disabled={readonly}
//             onChange={(event) =>
//               onChange(payment.id, "tenderId", event.target.value)
//             }
//             className="mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none disabled:opacity-70 dark:bg-white/[0.05]"
//           >
//             {[...KIYAN_GATEWAYS, { id: "125", title: "تخفیف درصدی" }, { id: "126", title: "بن ریالی" }].map(
//               (gateway) => (
//                 <option key={gateway.id} value={gateway.id}>
//                   {gateway.title}
//                 </option>
//               )
//             )}
//           </select>
//         </div>

//         <KiyanInput
//           label="مبلغ - تومان"
//           value={payment.amount}
//           onChange={(value) => onChange(payment.id, "amount", value)}
//           placeholder="amount"
//           dir="ltr"
//           inputMode="numeric"
//           disabled={readonly}
//         />

//         <KiyanInput
//           label="serialNumber"
//           value={payment.serialNumber}
//           onChange={(value) => onChange(payment.id, "serialNumber", value)}
//           placeholder="برای تخفیف / بن"
//           dir="ltr"
//           disabled={readonly}
//         />

//         <div className="flex gap-2">
//           {payment.confirmed ? (
//             <button
//               type="button"
//               disabled={payment.locked}
//               onClick={() => onEdit(payment.id)}
//               className="flex h-11 items-center justify-center rounded-2xl bg-white/65 px-3 text-xs font-black text-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.06]"
//             >
//               ویرایش
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={() => onConfirm(payment.id)}
//               className="flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:-translate-y-0.5"
//             >
//               تایید
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={() => onRemove(payment.id)}
//             className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 transition hover:-translate-y-0.5 dark:text-rose-300"
//           >
//             <Trash2 className="h-4 w-4" />
//           </button>
//         </div>
//       </div>

//       <div className="mt-3 flex flex-wrap items-center gap-2">
//         <span className="rounded-full bg-black/[0.06] px-3 py-1 text-xs font-black text-foreground dark:bg-white/[0.08]">
//           {payment.label || tenderTitle}
//         </span>

//         <span
//           className={[
//             "rounded-full px-3 py-1 text-xs font-black",
//             payment.confirmed
//               ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
//               : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
//           ].join(" ")}
//         >
//           {payment.confirmed ? "تایید شده" : "در حال ویرایش"}
//         </span>

//         <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-700 dark:text-sky-300">
//           paymentAmount در payload:{" "}
//           {(parseMoney(payment.amount) * 10).toLocaleString("fa-IR")} ریال
//         </span>
//       </div>
//     </article>
//   );
// }

// function buildRealKiyanSalePayload(
//   order: SalesOrder,
//   fields: {
//     kiyanCustomerId: string;
//     itemDrafts: KiyanSaleItemDraft[];
//     paymentDrafts: KiyanPaymentDraft[];
//   }
// ): KiyanSalePayload {
//   return {
//     uniqueInfo: `${order.id}-${fields.kiyanCustomerId.trim()}`,
//     customerId: fields.kiyanCustomerId.trim(),
//     saleTransactionItemInformation: fields.itemDrafts.map((item) => ({
//       itemId: Number(item.itemId),
//       quantity: Number(item.quantity),
//       price: parseMoney(item.price),
//       priceWithDiscount: parseMoney(item.priceWithDiscount),
//       tax: 0,
//       charge: 0,
//       workerId: 0,
//       isCancel: false,
//     })),
//     paymentInformation: fields.paymentDrafts.map((payment) => ({
//       tenderId: payment.tenderId,
//       paymentAmount: parseMoney(payment.amount) * 10,
//       discountedAmount: 0,
//       rrn: "",
//       stan: "",
//       cardNumber: "",
//       hashedCardNumber: "",
//       customerIdentifier: "",
//       terminalCode: "",
//       serialNumber: payment.serialNumber.trim(),
//       giftCardPassword: "",
//     })),
//   };
// }

// function validateKiyanSalePayload({
//   order,
//   kiyanCustomerId,
//   itemDrafts,
//   paymentDrafts,
//   targetAmount,
//   confirmedPaymentTotal,
// }: {
//   order: SalesOrder;
//   kiyanCustomerId: string;
//   itemDrafts: KiyanSaleItemDraft[];
//   paymentDrafts: KiyanPaymentDraft[];
//   targetAmount: number;
//   confirmedPaymentTotal: number;
// }) {
//   if (!order.id) return "شماره سفارش معتبر نیست.";

//   if (!kiyanCustomerId.trim() || Number(kiyanCustomerId) <= 0) {
//     return "customerId کیان معتبر نیست.";
//   }

//   if (!itemDrafts.length) {
//     return "سبد خرید برای ثبت کیان خالی است.";
//   }

//   for (const item of itemDrafts) {
//     if (Number(item.itemId) <= 0) {
//       return "itemId یکی از محصولات معتبر نیست.";
//     }

//     if (Number(item.quantity) <= 0) {
//       return "quantity یکی از محصولات معتبر نیست.";
//     }

//     if (parseMoney(item.price) <= 0) {
//       return "price یکی از محصولات معتبر نیست.";
//     }

//     if (parseMoney(item.priceWithDiscount) < 0) {
//       return "priceWithDiscount یکی از محصولات معتبر نیست.";
//     }
//   }

//   const confirmedRows = paymentDrafts.filter((payment) => payment.confirmed);

//   if (!confirmedRows.length) {
//     return "هیچ درگاه پرداختی تایید نشده است.";
//   }

//   for (const payment of confirmedRows) {
//     if (!payment.tenderId) {
//       return "tenderId یکی از پرداخت‌ها معتبر نیست.";
//     }

//     if (parseMoney(payment.amount) <= 0) {
//       return "مبلغ یکی از پرداخت‌ها معتبر نیست.";
//     }

//     if (
//       (payment.tenderId === KIYAN_DISCOUNT_PERCENT ||
//         payment.tenderId === KIYAN_DISCOUNT_AMOUNT) &&
//       !payment.serialNumber.trim()
//     ) {
//       return "برای تخفیف یا بن، serialNumber الزامی است.";
//     }
//   }

//   if (targetAmount - confirmedPaymentTotal !== 0) {
//     return "جمع پرداخت‌های تاییدشده باید دقیقاً با مبلغ سفارش برابر باشد.";
//   }

//   return "";
// }

// function buildInitialSaleItemDrafts(order: SalesOrder): KiyanSaleItemDraft[] {
//   const totalQuantity = order.products.reduce(
//     (total, product) => total + product.quantity,
//     0
//   );

//   const safeTotalQuantity = Math.max(1, totalQuantity);
//   const fallbackUnitPrice = Math.round(order.payableAmount / safeTotalQuantity);

//   return order.products.map((product) => {
//     const unitPrice = resolveProductUnitPrice(product, fallbackUnitPrice);
//     const priceWithDiscount = resolveProductDiscountedPrice(product, unitPrice);

//     return {
//       productId: product.id,
//       itemId: String(resolveKiyanItemId(product)),
//       quantity: String(product.quantity),
//       price: String(unitPrice),
//       priceWithDiscount: String(priceWithDiscount),
//     };
//   });
// }

// function resolveProductUnitPrice(
//   product: SalesOrderProduct,
//   fallbackUnitPrice: number
// ) {
//   const extendedProduct = product as SalesOrderProduct & {
//     price?: number;
//     unitPrice?: number;
//     finalPrice?: number;
//     bamaliat?: number;
//   };

//   return (
//     Number(extendedProduct.finalPrice) ||
//     Number(extendedProduct.unitPrice) ||
//     Number(extendedProduct.price) ||
//     Number(extendedProduct.bamaliat) ||
//     fallbackUnitPrice
//   );
// }

// function resolveProductDiscountedPrice(
//   product: SalesOrderProduct,
//   unitPrice: number
// ) {
//   const extendedProduct = product as SalesOrderProduct & {
//     priceWithDiscount?: number;
//     discountTotal?: number;
//   };

//   if (Number(extendedProduct.priceWithDiscount) >= 0) {
//     return Number(extendedProduct.priceWithDiscount);
//   }

//   const discountTotal = Number(extendedProduct.discountTotal || 0);

//   if (discountTotal > 0 && product.quantity > 0) {
//     return Math.max(0, unitPrice - Math.round(discountTotal / product.quantity));
//   }

//   return unitPrice;
// }

// function resolveKiyanItemId(product: SalesOrderProduct) {
//   const extendedProduct = product as SalesOrderProduct & {
//     itmID?: number | string;
//     kiyanItemId?: number | string;
//   };

//   if (extendedProduct.itmID) return extendedProduct.itmID;
//   if (extendedProduct.kiyanItemId) return extendedProduct.kiyanItemId;

//   const barcodeDigits = String(product.barcode || "").replace(/\D/g, "");

//   if (barcodeDigits) return barcodeDigits;

//   return String(product.id).replace(/\D/g, "") || "0";
// }

// function resolveKiyanTenderId(order: SalesOrder) {
//   if (order.payment.gateway === "saman") return "621";
//   if (order.payment.gateway === "snapp_pay") return "1015";
//   if (order.payment.gateway === "medisa") return "1247";
//   if (order.payment.gateway === "wallet") return "399";

//   return "1";
// }

// function buildMockKiyanCustomerId(order: SalesOrder) {
//   const mobileDigits = order.customer.mobile.replace(/\D/g, "");
//   const suffix = mobileDigits.slice(-5) || String(order.id);

//   return `10${suffix}`;
// }

// function getTenderTitle(tenderId: string) {
//   if (tenderId === KIYAN_DISCOUNT_PERCENT) return "تخفیف درصدی";
//   if (tenderId === KIYAN_DISCOUNT_AMOUNT) return "بن ریالی";

//   return (
//     KIYAN_GATEWAYS.find((gateway) => gateway.id === tenderId)?.title ??
//     `Tender ${tenderId}`
//   );
// }

// function parseMoney(value: string | number) {
//   if (typeof value === "number") return Number.isFinite(value) ? value : 0;

//   const englishValue = value
//     .toString()
//     .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
//     .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
//     .replace(/[,،٫\s]/g, "");

//   const parsed = Number(englishValue);

//   return Number.isFinite(parsed) ? parsed : 0;
// }

// function createDraftId() {
//   return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

// function SectionTitle({
//   icon: Icon,
//   eyebrow,
//   title,
// }: {
//   icon: LucideIcon;
//   eyebrow: string;
//   title: string;
// }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
//         <Icon className="h-5 w-5" />
//       </div>

//       <div>
//         <p className="text-xs font-black text-sky-700 dark:text-sky-300">
//           {eyebrow}
//         </p>

//         <h2 className="text-lg font-black text-foreground">{title}</h2>
//       </div>
//     </div>
//   );
// }

// function KiyanInput({
//   label,
//   value,
//   onChange,
//   placeholder,
//   dir = "rtl",
//   type = "text",
//   inputMode = "text",
//   disabled = false,
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   placeholder: string;
//   dir?: "rtl" | "ltr";
//   type?: "text" | "date";
//   inputMode?: "text" | "numeric";
//   disabled?: boolean;
// }) {
//   return (
//     <div>
//       <label className="text-xs font-black text-muted-foreground">
//         {label}
//       </label>

//       <input
//         value={value}
//         type={type}
//         dir={dir}
//         inputMode={inputMode}
//         disabled={disabled}
//         onChange={(event) => onChange(event.target.value)}
//         placeholder={placeholder}
//         className={[
//           "mt-2 h-12 w-full rounded-[1.4rem] bg-white/55 px-4 text-sm font-black text-foreground outline-none placeholder:text-muted-foreground/70 focus:bg-white/70 disabled:opacity-70 dark:bg-white/[0.05] dark:focus:bg-white/[0.07]",
//           dir === "ltr" ? "text-left" : "text-right",
//         ].join(" ")}
//       />
//     </div>
//   );
// }

// function ReadOnlyBox({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <p className="text-xs font-black text-muted-foreground">{label}</p>

//       <div
//         dir="ltr"
//         className="mt-2 flex h-12 items-center rounded-[1.4rem] bg-white/45 px-4 text-left text-sm font-black text-foreground dark:bg-white/[0.04]"
//       >
//         {value}
//       </div>
//     </div>
//   );
// }

// function InfoRow({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white/45 px-3 py-2 dark:bg-white/[0.04]">
//       <span className="text-xs font-black text-muted-foreground">{label}</span>

//       <span className="truncate text-xs font-black text-foreground">
//         {value}
//       </span>
//     </div>
//   );
// }

// function ReadyLine({ active, label }: { active: boolean; label: string }) {
//   return (
//     <div
//       className={[
//         "flex items-center justify-between rounded-[1.2rem] px-3 py-2",
//         active
//           ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
//           : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
//       ].join(" ")}
//     >
//       <span className="text-xs font-black">{label}</span>

//       <span className="text-xs font-black">
//         {active ? "آماده" : "ناقص"}
//       </span>
//     </div>
//   );
// }


"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  Calculator,
  CheckCircle2,
  CreditCard,
  Database,
  FileWarning,
  Gift,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Save,
  UserRound,
} from "lucide-react";

import {
  SALES_ORDERS_BASE_PATH,
  getSalesOrderDetailPath,
} from "@/components/sales/orders/sales-orders.constants";
import { OrderNotFound } from "@/components/sales/orders/detail/order-detail-core-sections";
import {
  OrderWorkflowSection,
  OrderWorkflowShell,
  OrderWorkflowStepper,
  WorkflowInfoCard,
  WorkflowPayloadPreview,
  WorkflowResultBox,
  type OrderWorkflowStep,
} from "@/components/sales/orders/ux/order-workflow-shell";
import {
  buildKiyanSaleRecoveryDraft,
  buildKiyanSaleRecoveryPayload,
  getKiyanSaleFailureMeta,
  getRecoveryItemsTotal,
  getRecoveryPaymentsTotal,
  validateKiyanSaleRecovery,
} from "@/lib/orders/kiyan-sale-recovery";
import { kiyanSaleRecoveryService } from "@/services/kiyan-sale-recovery.service";
import { useSalesOrdersStore } from "@/store/sales-orders.store";
import type {
  KiyanSaleFailureReason,
  KiyanSaleMockScenario,
  KiyanSaleRecoveryResponse,
  KiyanSaleRecoveryResolutionPatch,
  KiyanSaleRecoveryServiceMode,
} from "@/types/kiyan-sale-recovery";

const MOCK_SCENARIOS: { value: KiyanSaleMockScenario; label: string }[] = [
  { value: "success", label: "موفق" },
  { value: "customer_not_found", label: "مشتری در کیان نیست" },
  { value: "gift_card_expired", label: "بن منقضی شده" },
  { value: "gift_card_invalid", label: "بن نامعتبر" },
  { value: "insufficient_credit", label: "اعتبار کافی نیست" },
  { value: "item_mapping_missing", label: "mapping کالا ناقص است" },
  { value: "duplicate_invoice", label: "فاکتور تکراری" },
  { value: "network_error", label: "خطای ارتباط" },
];

export default function KiyanSaleRecoveryPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const numericOrderId = Number(orderId);

  const orders = useSalesOrdersStore((state) => state.orders);
  const updatePrimaryKiyanInvoice = useSalesOrdersStore(
    (state) => state.updatePrimaryKiyanInvoice
  );
  const markOrderNeedsFollowUp = useSalesOrdersStore(
    (state) => state.markOrderNeedsFollowUp
  );

  const order = useMemo(
    () => orders.find((item) => item.id === numericOrderId),
    [numericOrderId, orders]
  );

  const [serviceMode, setServiceMode] =
    useState<KiyanSaleRecoveryServiceMode>("mock");
  const [mockScenario, setMockScenario] =
    useState<KiyanSaleMockScenario>("success");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [syncedCustomerId, setSyncedCustomerId] = useState("");
  const [creditApproved, setCreditApproved] = useState(false);
  const [existingInvoiceBarcode, setExistingInvoiceBarcode] = useState("");
  const [itemMappingBarcode, setItemMappingBarcode] = useState("");
  const [itemMappingId, setItemMappingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] =
    useState<KiyanSaleRecoveryResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolutionPatch = useMemo<KiyanSaleRecoveryResolutionPatch>(
    () => ({
      giftCardCode: giftCardCode.trim() || undefined,
      syncedCustomerId: syncedCustomerId.trim() || undefined,
      creditApproved,
      existingSaleReceiptBarcode:
        existingInvoiceBarcode.trim() || undefined,
      itemMappings:
        itemMappingBarcode.trim() && itemMappingId.trim()
          ? {
              [itemMappingBarcode.trim()]: itemMappingId.trim(),
            }
          : undefined,
    }),
    [
      creditApproved,
      existingInvoiceBarcode,
      giftCardCode,
      itemMappingBarcode,
      itemMappingId,
      syncedCustomerId,
    ]
  );

  const draft = useMemo(
    () => (order ? buildKiyanSaleRecoveryDraft(order, resolutionPatch) : null),
    [order, resolutionPatch]
  );

  const payload = useMemo(
    () =>
      draft
        ? buildKiyanSaleRecoveryPayload(draft, resolutionPatch)
        : null,
    [draft, resolutionPatch]
  );

  const validation = useMemo(
    () =>
      draft && payload
        ? validateKiyanSaleRecovery(draft, payload)
        : {
            isValid: false,
            errors: ["سفارش یا payload قابل ساخت نیست."],
            warnings: [],
          },
    [draft, payload]
  );

  if (!order || !draft || !payload) {
    return <OrderNotFound orderId={orderId} />;
  }

  const steps = getWorkflowSteps({
    hasValidationError: validation.errors.length > 0,
    hasResponse: Boolean(response),
    isSubmitting,
    failureReason: response?.data?.failureReason,
  });

  const itemsTotal = getRecoveryItemsTotal(draft.items);
  const paymentsTotal = getRecoveryPaymentsTotal(draft.payments);
  const failureReason = response?.data?.failureReason;

  async function submitKiyanRecovery() {
    if (!validation.isValid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setResponse(null);

    try {
      const result = await kiyanSaleRecoveryService.registerSiteOrderSale(
        payload,
        {
          mode: serviceMode,
          mockScenario,
          patch: resolutionPatch,
        }
      );

      setResponse(result);

      if (result.success && result.data?.saleReceiptBarcode) {
        updatePrimaryKiyanInvoice(order.id, result.data.saleReceiptBarcode);
        markOrderNeedsFollowUp(
          order.id,
          false,
          "فاکتور فروش کیان برای سفارش واقعی سایت ثبت شد"
        );
      } else {
        markOrderNeedsFollowUp(
          order.id,
          true,
          result.data?.failureReason
            ? `ثبت کیان ناموفق: ${result.data.failureReason}`
            : "ثبت کیان ناموفق بود"
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "خطای ناشناخته هنگام ثبت فروش کیان رخ داد.";

      setSubmitError(message);
      markOrderNeedsFollowUp(order.id, true, message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function syncCustomerLocally() {
    setSyncedCustomerId(order.customer.mobile.replace(/\D/g, "") || String(order.id));
  }

  function useProblemItemAsMappingTarget() {
    const firstItem = draft.items[0];

    if (!firstItem) return;

    setItemMappingBarcode(firstItem.variantBarcode);
    setItemMappingId(firstItem.kiyanItemId || "");
  }

  return (
    <main className="space-y-4">
      <OrderWorkflowShell
        eyebrow="Kiyan Sale Recovery"
        title={`ثبت فاکتور کیان از روی سفارش سایت #${order.id}`}
        description="این صفحه برای سفارش واقعی سایت است؛ آیتم‌ها، پرداخت و مشتری از سفارش سایت خوانده می‌شوند و اپراتور اجازه تغییر آزاد فاکتور را ندارد. فقط در صورت خطا، رفع مشکل محدود و قابل لاگ انجام می‌شود."
        orderLabel={`Order #${order.id}`}
        tone="violet"
        icon={BadgeDollarSign}
        breadcrumb={[
          {
            label: "همه سفارشات",
            href: SALES_ORDERS_BASE_PATH,
          },
          {
            label: `سفارش #${order.id}`,
            href: getSalesOrderDetailPath(order.id),
          },
          {
            label: "Recovery کیان",
          },
        ]}
        goal="ثبت یا retry فاکتور واقعی سایت در کیان بدون تغییر آزاد اطلاعات سفارش."
        currentStep={getCurrentStepLabel(steps)}
        expectedResult="ذخیره saleReceiptBarcode روی سفارش یا نمایش دلیل دقیق ثبت نشدن."
        secondaryActions={[
          {
            label: "جزئیات سفارش",
            href: getSalesOrderDetailPath(order.id),
          },
        ]}
      >
        <OrderWorkflowStepper steps={steps} />

        <OrderWorkflowSection
          title="۱. Context سفارش واقعی سایت"
          description="این اطلاعات readonly هستند و مبنای ساخت فاکتور کیان قرار می‌گیرند."
          variant="context"
          icon={Database}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <WorkflowInfoCard label="شماره سفارش" value={`#${order.id}`} tone="violet" />
            <WorkflowInfoCard label="مشتری" value={order.customer.fullName} tone="slate" />
            <WorkflowInfoCard
              label="مبلغ سفارش"
              value={`${order.payableAmount.toLocaleString("fa-IR")} تومان`}
              tone="emerald"
            />
            <WorkflowInfoCard
              label="فاکتور فعلی کیان"
              value={order.kiyanInvoice.code ?? "ثبت نشده"}
              tone={order.kiyanInvoice.code ? "emerald" : "rose"}
            />
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۲. آیتم‌ها و پرداخت‌های readonly"
          description="اینجا فقط بررسی انجام می‌شود. کالا، تعداد، پرداخت و مبلغ از سفارش سایت آمده‌اند و نباید آزادانه تغییر کنند."
          variant="data"
          icon={ReceiptText}
        >
          <div className="grid gap-4">
            <ReadonlyItemsPanel draft={draft} />
            <ReadonlyPaymentsPanel draft={draft} />

            <div className="grid gap-3 md:grid-cols-3">
              <WorkflowInfoCard
                label="جمع آیتم‌ها"
                value={`${itemsTotal.toLocaleString("fa-IR")} تومان`}
                tone="sky"
              />
              <WorkflowInfoCard
                label="جمع پرداخت‌ها"
                value={`${paymentsTotal.toLocaleString("fa-IR")} تومان`}
                tone="violet"
              />
              <WorkflowInfoCard
                label="اختلاف"
                value={`${(paymentsTotal - itemsTotal).toLocaleString("fa-IR")} تومان`}
                tone={paymentsTotal === itemsTotal ? "emerald" : "amber"}
              />
            </div>
          </div>
        </OrderWorkflowSection>

        <OrderWorkflowSection
          title="۳. کنترل قبل از ارسال"
          description="قبل از تلاش برای ثبت، خطاها و هشدارهای payload بررسی می‌شوند."
          variant="validation"
          icon={Calculator}
        >
          <div className="grid gap-3">
            {validation.errors.map((error) => (
              <WorkflowResultBox
                key={error}
                type="error"
                title="خطای اعتبارسنجی"
                message={error}
              />
            ))}

            {validation.warnings.map((warning) => (
              <WorkflowResultBox
                key={warning}
                type="warning"
                title="هشدار"
                message={warning}
              />
            ))}

            {validation.isValid ? (
              <WorkflowResultBox
                type="success"
                title="Payload آماده تلاش برای ثبت است"
                message="اطلاعات سفارش واقعی سایت به payload کیان تبدیل شده است."
              />
            ) : null}
          </div>
        </OrderWorkflowSection>

        <WorkflowPayloadPreview
          payload={payload}
          title="۴. Preview Payload کیان"
          description="این payload از اطلاعات سفارش سایت ساخته شده و اپراتور فقط آن را بررسی می‌کند."
        />

        <OrderWorkflowSection
          title="۵. ارسال به کیان و ثبت نتیجه"
          description="اگر ثبت موفق باشد barcode روی سفارش ذخیره می‌شود. اگر خطا بدهد، دلیل خطا و ابزار رفع همان خطا نمایش داده می‌شود."
          variant="submit"
          icon={Save}
        >
          <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
              <p className="text-sm font-black text-foreground">تنظیمات تلاش</p>

              <div className="mt-3 grid gap-3">
                <SelectInput
                  label="حالت سرویس"
                  value={serviceMode}
                  onChange={(value) =>
                    setServiceMode(value as KiyanSaleRecoveryServiceMode)
                  }
                  options={[
                    { value: "mock", label: "mock" },
                    { value: "api", label: "api" },
                  ]}
                />

                {serviceMode === "mock" ? (
                  <SelectInput
                    label="سناریوی تست"
                    value={mockScenario}
                    onChange={(value) =>
                      setMockScenario(value as KiyanSaleMockScenario)
                    }
                    options={MOCK_SCENARIOS}
                  />
                ) : null}
              </div>

              <button
                type="button"
                disabled={!validation.isValid || isSubmitting}
                onClick={submitKiyanRecovery}
                className={[
                  "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1.4rem] text-sm font-black text-white transition",
                  validation.isValid && !isSubmitting
                    ? "bg-emerald-600 hover:-translate-y-0.5"
                    : "cursor-not-allowed bg-slate-400",
                ].join(" ")}
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                تلاش برای ثبت در کیان
              </button>

              <Link
                href={getSalesOrderDetailPath(order.id)}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[1.3rem] bg-white/65 text-xs font-black text-foreground transition hover:-translate-y-0.5 dark:bg-white/[0.05]"
              >
                بازگشت به جزئیات سفارش
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {response ? (
                <WorkflowResultBox
                  type={response.success ? "success" : "error"}
                  title={
                    response.success
                      ? "ثبت کیان موفق بود"
                      : "ثبت کیان ناموفق بود"
                  }
                  message={response.message}
                  details={
                    response.data ? (
                      <pre
                        dir="ltr"
                        className="overflow-auto rounded-[1.2rem] bg-slate-950 p-3 text-left text-xs leading-6 text-slate-100"
                      >
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    ) : null
                  }
                />
              ) : null}

              {submitError ? (
                <WorkflowResultBox
                  type="error"
                  title="ارسال ناموفق بود"
                  message={submitError}
                />
              ) : null}

              {!response && !submitError ? (
                <WorkflowResultBox
                  type="info"
                  title="هنوز تلاشی ثبت نشده"
                  message="بعد از بررسی payload، تلاش برای ثبت در کیان را انجام بده."
                />
              ) : null}
            </div>
          </div>
        </OrderWorkflowSection>

        {failureReason ? (
          <FailureResolutionPanel
            reason={failureReason}
            giftCardCode={giftCardCode}
            setGiftCardCode={setGiftCardCode}
            syncedCustomerId={syncedCustomerId}
            setSyncedCustomerId={setSyncedCustomerId}
            syncCustomerLocally={syncCustomerLocally}
            creditApproved={creditApproved}
            setCreditApproved={setCreditApproved}
            existingInvoiceBarcode={existingInvoiceBarcode}
            setExistingInvoiceBarcode={setExistingInvoiceBarcode}
            itemMappingBarcode={itemMappingBarcode}
            setItemMappingBarcode={setItemMappingBarcode}
            itemMappingId={itemMappingId}
            setItemMappingId={setItemMappingId}
            useProblemItemAsMappingTarget={useProblemItemAsMappingTarget}
            onRetry={submitKiyanRecovery}
            isRetryDisabled={!validation.isValid || isSubmitting}
          />
        ) : null}
      </OrderWorkflowShell>
    </main>
  );
}

function ReadonlyItemsPanel({
  draft,
}: {
  draft: ReturnType<typeof buildKiyanSaleRecoveryDraft>;
}) {
  return (
    <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="mb-4 flex items-start gap-3">
        <PackageCheck className="mt-0.5 h-5 w-5 text-violet-700 dark:text-violet-300" />
        <div>
          <h3 className="text-sm font-black text-foreground">آیتم‌های سفارش</h3>
          <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
            این آیتم‌ها از سفارش سایت آمده‌اند و در recovery mode قابل تغییر آزاد نیستند.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {draft.items.map((item) => (
          <div
            key={item.id}
            className="rounded-[1.4rem] bg-white/55 p-3 dark:bg-white/[0.04]"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-black text-foreground">{item.title}</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge text={`کد پدر: ${item.parentProductCode}`} />
                  <Badge text={`barcode: ${item.variantBarcode}`} dir="ltr" tone="sky" />
                  <Badge text={`itemId: ${item.kiyanItemId}`} dir="ltr" tone="violet" />
                  {item.color ? <Badge text={`رنگ: ${item.color}`} tone="amber" /> : null}
                  {item.size ? <Badge text={`سایز: ${item.size}`} tone="amber" /> : null}
                </div>
              </div>

              <div className="text-left">
                <p className="text-xs font-black text-muted-foreground">تعداد</p>
                <p className="mt-1 text-sm font-black text-foreground">
                  {item.quantity.toLocaleString("fa-IR")}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <InfoMini label="قیمت واحد" value={`${item.priceToman.toLocaleString("fa-IR")} تومان`} />
              <InfoMini
                label="قیمت بعد تخفیف"
                value={`${item.priceWithDiscountToman.toLocaleString("fa-IR")} تومان`}
              />
              <InfoMini
                label="جمع ردیف"
                value={`${(item.priceWithDiscountToman * item.quantity).toLocaleString("fa-IR")} تومان`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadonlyPaymentsPanel({
  draft,
}: {
  draft: ReturnType<typeof buildKiyanSaleRecoveryDraft>;
}) {
  return (
    <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
      <div className="mb-4 flex items-start gap-3">
        <CreditCard className="mt-0.5 h-5 w-5 text-sky-700 dark:text-sky-300" />
        <div>
          <h3 className="text-sm font-black text-foreground">پرداخت سفارش</h3>
          <p className="mt-1 text-xs font-bold leading-6 text-muted-foreground">
            پرداخت از سفارش سایت خوانده شده و در حالت recovery آزادانه تغییر نمی‌کند.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {draft.payments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-[1.4rem] bg-white/55 p-3 dark:bg-white/[0.04]"
          >
            <p className="text-sm font-black text-foreground">{payment.title}</p>
            <div className="mt-2 grid gap-2">
              <InfoMini label="Tender" value={payment.tenderId} />
              <InfoMini
                label="مبلغ"
                value={`${payment.amountToman.toLocaleString("fa-IR")} تومان`}
              />
              <InfoMini
                label="Serial"
                value={payment.serialNumber || "ثبت نشده"}
                muted={!payment.serialNumber}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FailureResolutionPanel({
  reason,
  giftCardCode,
  setGiftCardCode,
  syncedCustomerId,
  setSyncedCustomerId,
  syncCustomerLocally,
  creditApproved,
  setCreditApproved,
  existingInvoiceBarcode,
  setExistingInvoiceBarcode,
  itemMappingBarcode,
  setItemMappingBarcode,
  itemMappingId,
  setItemMappingId,
  useProblemItemAsMappingTarget,
  onRetry,
  isRetryDisabled,
}: {
  reason: KiyanSaleFailureReason;
  giftCardCode: string;
  setGiftCardCode: (value: string) => void;
  syncedCustomerId: string;
  setSyncedCustomerId: (value: string) => void;
  syncCustomerLocally: () => void;
  creditApproved: boolean;
  setCreditApproved: (value: boolean) => void;
  existingInvoiceBarcode: string;
  setExistingInvoiceBarcode: (value: string) => void;
  itemMappingBarcode: string;
  setItemMappingBarcode: (value: string) => void;
  itemMappingId: string;
  setItemMappingId: (value: string) => void;
  useProblemItemAsMappingTarget: () => void;
  onRetry: () => void;
  isRetryDisabled: boolean;
}) {
  const meta = getKiyanSaleFailureMeta(reason);

  return (
    <OrderWorkflowSection
      title="۶. رفع مشکل ثبت نشدن کیان"
      description="این بخش فقط بعد از خطای کیان نمایش داده می‌شود و برای هر خطا، ابزار رفع محدود و قابل کنترل ارائه می‌کند."
      variant="result"
      icon={FileWarning}
    >
      <div className="rounded-[1.7rem] bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300">
        <h3 className="text-base font-black">{meta.title}</h3>
        <p className="mt-2 text-sm font-bold leading-7">{meta.description}</p>
      </div>

      <div className="mt-4 grid gap-4">
        {reason === "customer_not_found" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={UserRound} title="ثبت یا sync مشتری در کیان" />
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <TextInput
                label="Customer ID بعد از sync"
                value={syncedCustomerId}
                onChange={setSyncedCustomerId}
                dir="ltr"
              />
              <button
                type="button"
                onClick={syncCustomerLocally}
                className="self-end rounded-[1.3rem] bg-violet-600 px-5 py-3 text-xs font-black text-white"
              >
                mock sync مشتری
              </button>
            </div>
          </div>
        ) : null}

        {reason === "gift_card_expired" || reason === "gift_card_invalid" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={Gift} title="ورود بن هدیه جدید" />
            <TextInput
              label="Gift Card / Bon Code جدید"
              value={giftCardCode}
              onChange={setGiftCardCode}
              dir="ltr"
            />
          </div>
        ) : null}

        {reason === "insufficient_credit" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={CheckCircle2} title="تایید بررسی اعتبار" />
            <button
              type="button"
              onClick={() => setCreditApproved(!creditApproved)}
              className={[
                "mt-3 rounded-[1.3rem] px-5 py-3 text-xs font-black text-white",
                creditApproved ? "bg-emerald-600" : "bg-amber-600",
              ].join(" ")}
            >
              {creditApproved ? "اعتبار تایید شده" : "تایید اعتبار برای retry"}
            </button>
          </div>
        ) : null}

        {reason === "item_not_found" || reason === "item_mapping_missing" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={PackageCheck} title="اصلاح mapping کالا" />
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <TextInput
                label="Variant Barcode"
                value={itemMappingBarcode}
                onChange={setItemMappingBarcode}
                dir="ltr"
              />
              <TextInput
                label="Kiyan Item ID صحیح"
                value={itemMappingId}
                onChange={setItemMappingId}
                dir="ltr"
              />
              <button
                type="button"
                onClick={useProblemItemAsMappingTarget}
                className="self-end rounded-[1.3rem] bg-sky-600 px-5 py-3 text-xs font-black text-white"
              >
                پر کردن از آیتم اول
              </button>
            </div>
          </div>
        ) : null}

        {reason === "duplicate_invoice" ? (
          <div className="rounded-[1.7rem] bg-white/45 p-4 dark:bg-white/[0.04]">
            <SectionMiniTitle icon={ReceiptText} title="ذخیره barcode فاکتور موجود" />
            <TextInput
              label="Existing Sale Receipt Barcode"
              value={existingInvoiceBarcode}
              onChange={setExistingInvoiceBarcode}
              dir="ltr"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onRetry}
          disabled={isRetryDisabled}
          className={[
            "inline-flex h-12 items-center justify-center gap-2 rounded-[1.4rem] px-5 text-sm font-black text-white transition",
            isRetryDisabled
              ? "cursor-not-allowed bg-slate-400"
              : "bg-emerald-600 hover:-translate-y-0.5",
          ].join(" ")}
        >
          <RefreshCw className="h-4 w-4" />
          تلاش مجدد بعد از رفع مشکل
        </button>
      </div>
    </OrderWorkflowSection>
  );
}

function Badge({
  text,
  tone = "slate",
  dir,
}: {
  text: string;
  tone?: "slate" | "sky" | "violet" | "amber";
  dir?: "ltr" | "rtl";
}) {
  const className =
    tone === "sky"
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : tone === "violet"
        ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
        : tone === "amber"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "bg-slate-500/10 text-slate-700 dark:text-slate-300";

  return (
    <span
      dir={dir}
      className={`rounded-full px-3 py-1 text-[11px] font-black ${className}`}
    >
      {text}
    </span>
  );
}

function InfoMini({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-[1.2rem] bg-white/45 p-3 dark:bg-white/[0.04]">
      <p className="text-[11px] font-black text-muted-foreground">{label}</p>
      <p className={["mt-1 text-sm font-black", muted ? "text-muted-foreground" : "text-foreground"].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function SectionMiniTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-violet-700 dark:text-violet-300" />
      <p className="text-sm font-black text-foreground">{title}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  dir = "rtl",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-[1.25rem] bg-white/65 px-4 text-sm font-bold text-foreground outline-none dark:bg-white/[0.05]"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-[1.25rem] bg-white/65 px-4 text-sm font-bold text-foreground outline-none dark:bg-white/[0.05]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function getWorkflowSteps({
  hasValidationError,
  hasResponse,
  isSubmitting,
  failureReason,
}: {
  hasValidationError: boolean;
  hasResponse: boolean;
  isSubmitting: boolean;
  failureReason?: KiyanSaleFailureReason;
}): OrderWorkflowStep[] {
  return [
    {
      id: "context",
      title: "Context سفارش",
      description: "سفارش واقعی سایت",
      status: "done",
    },
    {
      id: "readonly-data",
      title: "دیتای readonly",
      description: "آیتم‌ها و پرداخت",
      status: "done",
    },
    {
      id: "validation",
      title: "کنترل payload",
      description: "خطاها و هشدارها",
      status: hasValidationError ? "warning" : "done",
    },
    {
      id: "submit",
      title: "ارسال به کیان",
      description: "ثبت یا دریافت خطا",
      status: hasResponse ? "done" : isSubmitting ? "current" : "todo",
    },
    {
      id: "resolution",
      title: "رفع خطا",
      description: "ابزار retry",
      status: failureReason ? "current" : hasResponse ? "done" : "todo",
    },
  ];
}

function getCurrentStepLabel(steps: OrderWorkflowStep[]) {
  const current =
    steps.find((step) => step.status === "current") ??
    steps.find((step) => step.status === "warning") ??
    steps.find((step) => step.status === "todo") ??
    steps[steps.length - 1];

  return current?.title ?? "در حال بررسی";
}
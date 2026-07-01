import { ROUTES } from "@/config/routes";

export const SALES_ORDERS_BASE_PATH = ROUTES.orders.list;
export const SALES_ORDERS_RETURNS_PATH = ROUTES.orders.returns;
export const SALES_ORDERS_EXCHANGES_PATH = ROUTES.orders.exchanges;
export const SALES_ORDERS_SNAPP_PATH = ROUTES.orders.snapp;
export const SALES_ORDERS_MANUAL_PATH = ROUTES.orders.manual;
export const SALES_ORDERS_CREATE_PATH = ROUTES.orders.new;
export const SALES_ORDERS_KIYAN_SALE_PATH = ROUTES.orders.kiyanSale;

export function getSalesOrderDetailPath(id: number | string) {
  return `${SALES_ORDERS_BASE_PATH}/${id}`;
}

export const salesOrdersPageClass =
  "mx-auto flex w-full max-w-[1540px] flex-col gap-6 p-4 sm:p-6";

export const salesOrdersHeroClass =
  "glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-6";

export const salesOrdersPanelClass =
  "glass-card rounded-[2rem] p-4 sm:p-5";

export const salesOrdersInputClass =
  "h-12 w-full rounded-2xl border border-border bg-background/45 px-4 text-sm font-bold text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/40 focus:bg-background/65";

export const salesOrdersPrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50";

export const salesOrdersSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/45 px-4 py-3 text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-50";

export function getSalesOrderReturnCreatePath(id: number | string) {
  return `${SALES_ORDERS_BASE_PATH}/${id}/return/new`;
}

export function getSalesOrderExchangeCreatePath(id: number | string) {
  return `${SALES_ORDERS_BASE_PATH}/${id}/exchange/new`;
}

export function getSalesOrderKiyanSaleCreatePath(id: number | string) {
  return `${SALES_ORDERS_BASE_PATH}/${id}/kiyan/sale/new`;
}

export function getDirectSalesOrderKiyanSalePath(orderId?: number | string) {
  if (!orderId) return SALES_ORDERS_KIYAN_SALE_PATH;

  return `${SALES_ORDERS_KIYAN_SALE_PATH}?orderId=${orderId}`;
}

export function getSalesOrderSnappUpdatePath(id: number | string) {
  return `${SALES_ORDERS_BASE_PATH}/${id}/snapp/update`;
}
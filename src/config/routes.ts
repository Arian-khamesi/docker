export const ROUTES = {
  home: "/",

  auth: {
    login: "/login",
  },

  dashboard: {
    home: "/dashboard",
    reports: "/dashboard/reports",
  },

  content: {
    menuManagement: "/dashboard/content/menu-management",
    sliderManagement: "/dashboard/content/slider-management",
    homepageHighlights: "/dashboard/content/homepage-highlights",
    productCarousels: "/dashboard/content/product-carousels",
    categoryCarousels: "/dashboard/content/category-carousels",
    blog: "/dashboard/content/blog",
  },

  products: {
    list: "/dashboard/products",
    new: "/dashboard/products/new",
    categories: "/dashboard/products/categories",
  },

  crm: {
    customers: "/dashboard/crm/customers",
    tickets: "/dashboard/crm/tickets",
  },

  orders: {
    list: "/dashboard/orders",
    new: "/dashboard/orders/new",
    returns: "/dashboard/orders/returns",
    exchanges: "/dashboard/orders/exchanges",
    snapp: "/dashboard/orders/snapp",
    manual: "/dashboard/orders/manual",
    kiyanSale: "/dashboard/orders/kiyan/sale/new",
  },

  inventory: {
    stock: "/dashboard/inventory",
    movements: "/dashboard/inventory/movements",
  },

  salesChannels: {
    list: "/dashboard/sales-channels",
  },

  campaigns: {
    list: "/dashboard/campaigns",
  },

  systemReports: {
    list: "/dashboard/system-reports",
  },

  analytics: {
    list: "/dashboard/analytics",
  },

  workflows: {
    list: "/dashboard/workflows",
  },

  settings: {
    general: "/dashboard/settings",
    security: "/dashboard/settings/security",
  },

  account: {
    profile: "/profile",
    tasks: "/tasks",
    settings: "/account/settings",
    pricing: "/pricing",
  },
} as const;
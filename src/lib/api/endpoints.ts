import { endpointPath } from "@/lib/api/endpoint-resolver";
import type { QueryParams } from "@/lib/api/endpoint.types";

export {
  API_ENDPOINTS,
  getApiEndpointDefinition,
  type ApiEndpointKey,
} from "@/lib/api/endpoints/index";

export type {
  ApiBaseTarget,
  ApiContentType,
  ApiEndpointDefinition,
  ApiMethod,
  PathParams,
  QueryParams,
  QueryValue,
} from "@/lib/api/endpoint.types";

export { endpointPath } from "@/lib/api/endpoint-resolver";

/**
 * Backward-compatible object.
 * کدهای قدیمی پروژه که از ENDPOINTS.auth.login یا ENDPOINTS.slider.update(uuid)
 * استفاده می‌کنند، همچنان بدون تغییر کار می‌کنند.
 */
export const ENDPOINTS = {
  health: {
    check: endpointPath("health.check"),
  },

  auth: {
    login: endpointPath("auth.login"),
    me: endpointPath("auth.me"),
    logout: endpointPath("auth.logout"),
  },

  permissions: {
    list: endpointPath("permissions.list"),
  },

  navigation: {
    list: endpointPath("navigation.list"),
  },

  liang: {
    navCounts: endpointPath("liang.navCounts"),
  },

menu: {
  list: endpointPath("menu.list"),

  tree: (params?: QueryParams) =>
    endpointPath("menu.tree", {
      query: params,
    }),

  desktop: endpointPath("menu.desktop"),
  mobile: endpointPath("menu.mobile"),

  updateDesktop: endpointPath("menu.updateDesktop"),
  updateMobile: endpointPath("menu.updateMobile"),

  saveStructure: endpointPath("menu.saveStructure"),
  create: endpointPath("menu.create"),

  update: (id: string | number) =>
    endpointPath("menu.update", {
      pathParams: {
        id,
      },
    }),

  delete: (id: string | number) =>
    endpointPath("menu.delete", {
      pathParams: {
        id,
      },
    }),

  reorder: endpointPath("menu.reorder"),
  uploadImage: endpointPath("menu.uploadImage"),
},

slider: {
  list: (params?: QueryParams) =>
    endpointPath("slider.list", {
      query: params,
    }),

  detail: (id: string | number) =>
    endpointPath("slider.detail", {
      pathParams: {
        id,
        uuid: id,
      },
    }),

  create: endpointPath("slider.create"),

  update: (id: string | number) =>
    endpointPath("slider.update", {
      pathParams: {
        id,
        uuid: id,
      },
    }),

  delete: (id: string | number) =>
    endpointPath("slider.delete", {
      pathParams: {
        id,
        uuid: id,
      },
    }),

  publish: (id: string | number) =>
    endpointPath("slider.publish", {
      pathParams: {
        id,
        uuid: id,
      },
    }),

  unpublish: (id: string | number) =>
    endpointPath("slider.unpublish", {
      pathParams: {
        id,
        uuid: id,
      },
    }),

  activate: (id: string | number) =>
    endpointPath("slider.activate", {
      pathParams: {
        id,
        uuid: id,
      },
    }),

  deactivate: (id: string | number) =>
    endpointPath("slider.deactivate", {
      pathParams: {
        id,
        uuid: id,
      },
    }),

  reorder: endpointPath("slider.reorder"),
  uploadImage: endpointPath("slider.uploadImage"),
},

  media: {
    upload: endpointPath("media.upload"),
  },

  snapp: {
    getOrderReceiptDetail: endpointPath("snapp.getOrderReceiptDetail"),
    getProductDetail: endpointPath("snapp.getProductDetail"),
    updateTransactionByAdmin: endpointPath("snapp.updateTransactionByAdmin"),
  },

  kiyan: {
    sale: {
      recovery: endpointPath("kiyan.sale.recovery"),
      existingInvoice: endpointPath("kiyan.sale.existingInvoice"),
    },

    customer: {
      sync: endpointPath("kiyan.customer.sync"),
    },

    product: {
      mapping: endpointPath("kiyan.product.mapping"),
    },

    return: {
      registerItems: endpointPath("kiyan.return.registerItems"),

      receiptHeader: (params?: QueryParams) =>
        endpointPath("kiyan.return.receiptHeader", {
          query: params,
        }),

      existingReturn: endpointPath("kiyan.return.existingReturn"),
    },
  },
} as const;

export type ApiEndpointGroup = keyof typeof ENDPOINTS;
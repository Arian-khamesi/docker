type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;

function api(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function buildQuery(params?: QueryParams) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });

      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

function withQuery(path: string, params?: QueryParams) {
  return `${path}${buildQuery(params)}`;
}

export const ENDPOINTS = {
  auth: {
    login: api("/auth/login"),
    me: api("/auth/me"),
    logout: api("/auth/logout"),
  },

  permissions: {
    list: api("/permissions"),
  },

  navigation: {
    list: api("/navigation"),
  },

  liang: {
    navCounts: api("/liang/nav-counts"),
  },

  menu: {
    list: api("/content/menus"),
    desktop: api("/content/menus/desktop"),
    mobile: api("/content/menus/mobile"),

    updateDesktop: api("/content/menus/desktop"),
    updateMobile: api("/content/menus/mobile"),
  },

  slider: {
    list: (params?: QueryParams) =>
      withQuery(api("/content/sliders"), params),

    create: api("/content/sliders"),

    update: (uuid: string) => api(`/content/sliders/${uuid}`),

    delete: (uuid: string) => api(`/content/sliders/${uuid}`),

    reorder: api("/content/sliders/reorder"),
  },

  media: {
    upload: api("/media"),
  },
} as const;

export type ApiEndpointGroup = keyof typeof ENDPOINTS;
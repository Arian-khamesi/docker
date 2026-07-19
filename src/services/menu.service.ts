import type { MenuItem, MenuType } from "@/types/menu";

import { httpClient } from "@/lib/api/http-client";
import {
  type ApiEnvelope,
  unwrapApiData,
} from "@/lib/api/api-response";

export interface GetMenuTreeParams {
  type?: MenuType;
  isActive?: boolean;
}

export interface MenuTreeData {
  desktopMenu: MenuItem[];
  mobileMenu: MenuItem[];
}

export interface SaveMenuStructurePayload {
  desktopMenu: MenuItem[];
  mobileMenu: MenuItem[];
}

export interface ReorderMenuPayload {
  type: MenuType;
  parentId?: string | null;
  orderedIds: string[];
}

export type CreateMenuItemPayload = Omit<MenuItem, "id">;

export type UpdateMenuItemPayload = Partial<Omit<MenuItem, "id">>;

export const menuService = {
  async getMenuTree(params?: GetMenuTreeParams) {
    const response = await httpClient.endpoint<ApiEnvelope<MenuTreeData>>(
      "menu.tree",
      {
        query: params,
      }
    );

    return unwrapApiData(response, "دریافت ساختار منو با خطا مواجه شد.");
  },

  async saveMenuStructure(payload: SaveMenuStructurePayload) {
    const response = await httpClient.endpoint<
      ApiEnvelope<MenuTreeData>,
      SaveMenuStructurePayload
    >("menu.saveStructure", {
      body: payload,
    });

    return unwrapApiData(response, "ذخیره ساختار منو با خطا مواجه شد.");
  },

  async createMenuItem(payload: CreateMenuItemPayload) {
    const response = await httpClient.endpoint<
      ApiEnvelope<{ item: MenuItem }>,
      CreateMenuItemPayload
    >("menu.create", {
      body: payload,
    });

    return unwrapApiData(response, "ایجاد آیتم منو با خطا مواجه شد.").item;
  },

  async updateMenuItem(id: string | number, payload: UpdateMenuItemPayload) {
    const response = await httpClient.endpoint<
      ApiEnvelope<{ item: MenuItem }>,
      UpdateMenuItemPayload
    >("menu.update", {
      pathParams: {
        id,
      },
      body: payload,
    });

    return unwrapApiData(response, "ویرایش آیتم منو با خطا مواجه شد.").item;
  },

  async deleteMenuItem(id: string | number) {
    const response = await httpClient.endpoint<
      ApiEnvelope<{ success: boolean }>
    >("menu.delete", {
      pathParams: {
        id,
      },
    });

    return unwrapApiData(response, "حذف آیتم منو با خطا مواجه شد.");
  },

  async reorderMenu(payload: ReorderMenuPayload) {
    const response = await httpClient.endpoint<
      ApiEnvelope<MenuTreeData>,
      ReorderMenuPayload
    >("menu.reorder", {
      body: payload,
    });

    return unwrapApiData(response, "مرتب‌سازی منو با خطا مواجه شد.");
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.endpoint<
      ApiEnvelope<{ url: string }>,
      FormData
    >("menu.uploadImage", {
      body: formData,
    });

    return unwrapApiData(response, "آپلود تصویر منو با خطا مواجه شد.");
  },
};
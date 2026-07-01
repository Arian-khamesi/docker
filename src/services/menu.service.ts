import type { MenuItem, MenuType } from "@/types/menu";

import { ENDPOINTS } from "@/lib/api/endpoints";
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
    const response = await httpClient.get<ApiEnvelope<MenuTreeData>>(
      ENDPOINTS.menu.tree(params),
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "دریافت ساختار منو با خطا مواجه شد.");
  },

  async saveMenuStructure(payload: SaveMenuStructurePayload) {
    const response = await httpClient.put<
      ApiEnvelope<MenuTreeData>,
      SaveMenuStructurePayload
    >(ENDPOINTS.menu.saveStructure, payload, {
      auth: true,
    });

    return unwrapApiData(response, "ذخیره ساختار منو با خطا مواجه شد.");
  },

  async createMenuItem(payload: CreateMenuItemPayload) {
    const response = await httpClient.post<
      ApiEnvelope<{ item: MenuItem }>,
      CreateMenuItemPayload
    >(ENDPOINTS.menu.create, payload, {
      auth: true,
    });

    return unwrapApiData(response, "ایجاد آیتم منو با خطا مواجه شد.").item;
  },

  async updateMenuItem(id: string | number, payload: UpdateMenuItemPayload) {
    const response = await httpClient.patch<
      ApiEnvelope<{ item: MenuItem }>,
      UpdateMenuItemPayload
    >(ENDPOINTS.menu.update(id), payload, {
      auth: true,
    });

    return unwrapApiData(response, "ویرایش آیتم منو با خطا مواجه شد.").item;
  },

  async deleteMenuItem(id: string | number) {
    const response = await httpClient.delete<ApiEnvelope<{ success: boolean }>>(
      ENDPOINTS.menu.delete(id),
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "حذف آیتم منو با خطا مواجه شد.");
  },

  async reorderMenu(payload: ReorderMenuPayload) {
    const response = await httpClient.post<
      ApiEnvelope<MenuTreeData>,
      ReorderMenuPayload
    >(ENDPOINTS.menu.reorder, payload, {
      auth: true,
    });

    return unwrapApiData(response, "مرتب‌سازی منو با خطا مواجه شد.");
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.post<
      ApiEnvelope<{ url: string }>,
      FormData
    >(ENDPOINTS.menu.uploadImage, formData, {
      auth: true,
    });

    return unwrapApiData(response, "آپلود تصویر منو با خطا مواجه شد.");
  },
};
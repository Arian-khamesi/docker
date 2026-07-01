import type { Slide } from "@/types/slider";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { httpClient } from "@/lib/api/http-client";
import {
  type ApiEnvelope,
  unwrapApiData,
} from "@/lib/api/api-response";

export interface GetSlidesParams {
  status?: Slide["status"];
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export type CreateSlidePayload = Omit<Slide, "id" | "createdAt" | "updatedAt">;

export type UpdateSlidePayload = Partial<
  Omit<Slide, "id" | "createdAt" | "updatedAt">
>;

export interface ReorderSlidesPayload {
  orderedIds: string[];
}

interface SlidesListResponse {
  slides: Slide[];
  total?: number;
}

export const sliderService = {
  async getSlides(params?: GetSlidesParams) {
    const response = await httpClient.get<ApiEnvelope<SlidesListResponse>>(
      ENDPOINTS.slider.list(params),
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "دریافت لیست اسلایدرها با خطا مواجه شد.");
  },

  async getSlide(id: string | number) {
    const response = await httpClient.get<ApiEnvelope<{ slide: Slide }>>(
      ENDPOINTS.slider.detail(id),
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "دریافت اطلاعات اسلاید با خطا مواجه شد.")
      .slide;
  },

  async createSlide(payload: CreateSlidePayload) {
    const response = await httpClient.post<
      ApiEnvelope<{ slide: Slide }>,
      CreateSlidePayload
    >(ENDPOINTS.slider.create, payload, {
      auth: true,
    });

    return unwrapApiData(response, "ایجاد اسلاید با خطا مواجه شد.").slide;
  },

  async updateSlide(id: string | number, payload: UpdateSlidePayload) {
    const response = await httpClient.patch<
      ApiEnvelope<{ slide: Slide }>,
      UpdateSlidePayload
    >(ENDPOINTS.slider.update(id), payload, {
      auth: true,
    });

    return unwrapApiData(response, "ویرایش اسلاید با خطا مواجه شد.").slide;
  },

  async deleteSlide(id: string | number) {
    const response = await httpClient.delete<ApiEnvelope<{ success: boolean }>>(
      ENDPOINTS.slider.delete(id),
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "حذف اسلاید با خطا مواجه شد.");
  },

  async publishSlide(id: string | number) {
    const response = await httpClient.post<ApiEnvelope<{ slide: Slide }>>(
      ENDPOINTS.slider.publish(id),
      undefined,
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "انتشار اسلاید با خطا مواجه شد.").slide;
  },

  async unpublishSlide(id: string | number) {
    const response = await httpClient.post<ApiEnvelope<{ slide: Slide }>>(
      ENDPOINTS.slider.unpublish(id),
      undefined,
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "لغو انتشار اسلاید با خطا مواجه شد.").slide;
  },

  async activateSlide(id: string | number) {
    const response = await httpClient.post<ApiEnvelope<{ slide: Slide }>>(
      ENDPOINTS.slider.activate(id),
      undefined,
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "فعال‌سازی اسلاید با خطا مواجه شد.").slide;
  },

  async deactivateSlide(id: string | number) {
    const response = await httpClient.post<ApiEnvelope<{ slide: Slide }>>(
      ENDPOINTS.slider.deactivate(id),
      undefined,
      {
        auth: true,
      }
    );

    return unwrapApiData(response, "غیرفعال‌سازی اسلاید با خطا مواجه شد.")
      .slide;
  },

  async reorderSlides(payload: ReorderSlidesPayload) {
    const response = await httpClient.post<
      ApiEnvelope<{ slides: Slide[] }>,
      ReorderSlidesPayload
    >(ENDPOINTS.slider.reorder, payload, {
      auth: true,
    });

    return unwrapApiData(response, "مرتب‌سازی اسلایدها با خطا مواجه شد.")
      .slides;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.post<
      ApiEnvelope<{ url: string; alt?: string }>,
      FormData
    >(ENDPOINTS.slider.uploadImage, formData, {
      auth: true,
    });

    return unwrapApiData(response, "آپلود تصویر با خطا مواجه شد.");
  },
};
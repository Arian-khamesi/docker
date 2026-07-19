import type { Slide } from "@/types/slider";

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
    const response = await httpClient.endpoint<
      ApiEnvelope<SlidesListResponse>
    >("slider.list", {
      query: params,
    });

    return unwrapApiData(response, "دریافت لیست اسلایدرها با خطا مواجه شد.");
  },

  async getSlide(id: string | number) {
    const response = await httpClient.endpoint<ApiEnvelope<{ slide: Slide }>>(
      "slider.detail",
      {
        pathParams: {
          id,
          uuid: id,
        },
      }
    );

    return unwrapApiData(response, "دریافت اطلاعات اسلاید با خطا مواجه شد.")
      .slide;
  },

  async createSlide(payload: CreateSlidePayload) {
    const response = await httpClient.endpoint<
      ApiEnvelope<{ slide: Slide }>,
      CreateSlidePayload
    >("slider.create", {
      body: payload,
    });

    return unwrapApiData(response, "ایجاد اسلاید با خطا مواجه شد.").slide;
  },

  async updateSlide(id: string | number, payload: UpdateSlidePayload) {
    const response = await httpClient.endpoint<
      ApiEnvelope<{ slide: Slide }>,
      UpdateSlidePayload
    >("slider.update", {
      pathParams: {
        id,
        uuid: id,
      },
      body: payload,
    });

    return unwrapApiData(response, "ویرایش اسلاید با خطا مواجه شد.").slide;
  },

  async deleteSlide(id: string | number) {
    const response = await httpClient.endpoint<
      ApiEnvelope<{ success: boolean }>
    >("slider.delete", {
      pathParams: {
        id,
        uuid: id,
      },
    });

    return unwrapApiData(response, "حذف اسلاید با خطا مواجه شد.");
  },

  async publishSlide(id: string | number) {
    const response = await httpClient.endpoint<ApiEnvelope<{ slide: Slide }>>(
      "slider.publish",
      {
        pathParams: {
          id,
          uuid: id,
        },
      }
    );

    return unwrapApiData(response, "انتشار اسلاید با خطا مواجه شد.").slide;
  },

  async unpublishSlide(id: string | number) {
    const response = await httpClient.endpoint<ApiEnvelope<{ slide: Slide }>>(
      "slider.unpublish",
      {
        pathParams: {
          id,
          uuid: id,
        },
      }
    );

    return unwrapApiData(response, "لغو انتشار اسلاید با خطا مواجه شد.").slide;
  },

  async activateSlide(id: string | number) {
    const response = await httpClient.endpoint<ApiEnvelope<{ slide: Slide }>>(
      "slider.activate",
      {
        pathParams: {
          id,
          uuid: id,
        },
      }
    );

    return unwrapApiData(response, "فعال‌سازی اسلاید با خطا مواجه شد.").slide;
  },

  async deactivateSlide(id: string | number) {
    const response = await httpClient.endpoint<ApiEnvelope<{ slide: Slide }>>(
      "slider.deactivate",
      {
        pathParams: {
          id,
          uuid: id,
        },
      }
    );

    return unwrapApiData(response, "غیرفعال‌سازی اسلاید با خطا مواجه شد.")
      .slide;
  },

  async reorderSlides(payload: ReorderSlidesPayload) {
    const response = await httpClient.endpoint<
      ApiEnvelope<{ slides: Slide[] }>,
      ReorderSlidesPayload
    >("slider.reorder", {
      body: payload,
    });

    return unwrapApiData(response, "مرتب‌سازی اسلایدها با خطا مواجه شد.")
      .slides;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient.endpoint<
      ApiEnvelope<{ url: string; alt?: string }>,
      FormData
    >("slider.uploadImage", {
      body: formData,
    });

    return unwrapApiData(response, "آپلود تصویر با خطا مواجه شد.");
  },
};
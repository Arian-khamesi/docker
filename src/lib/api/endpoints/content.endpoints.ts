import { defineEndpoints } from "@/lib/api/endpoint.types";

export const contentEndpoints = defineEndpoints([
  /**
   * Menus
   */
  {
    key: "menu.list",
    method: "GET",
    path: "/content/menus",
    auth: true,
    description: "Get all menus",
  },
  {
    key: "menu.tree",
    method: "GET",
    path: "/content/menus/tree",
    auth: true,
    description: "Get menu tree",
  },
  {
    key: "menu.desktop",
    method: "GET",
    path: "/content/menus/desktop",
    auth: true,
    description: "Get desktop menu",
  },
  {
    key: "menu.mobile",
    method: "GET",
    path: "/content/menus/mobile",
    auth: true,
    description: "Get mobile menu",
  },
  {
    key: "menu.updateDesktop",
    method: "PUT",
    path: "/content/menus/desktop",
    auth: true,
    description: "Update desktop menu",
  },
  {
    key: "menu.updateMobile",
    method: "PUT",
    path: "/content/menus/mobile",
    auth: true,
    description: "Update mobile menu",
  },
  {
    key: "menu.saveStructure",
    method: "PUT",
    path: "/content/menus/structure",
    auth: true,
    description: "Save full menu structure",
  },
  {
    key: "menu.create",
    method: "POST",
    path: "/content/menus/items",
    auth: true,
    description: "Create menu item",
  },
  {
    key: "menu.update",
    method: "PATCH",
    path: "/content/menus/items/:id",
    auth: true,
    description: "Update menu item",
  },
  {
    key: "menu.delete",
    method: "DELETE",
    path: "/content/menus/items/:id",
    auth: true,
    description: "Delete menu item",
  },
  {
    key: "menu.reorder",
    method: "POST",
    path: "/content/menus/reorder",
    auth: true,
    description: "Reorder menu items",
  },
  {
    key: "menu.uploadImage",
    method: "POST",
    path: "/content/menus/upload-image",
    auth: true,
    contentType: "multipart",
    description: "Upload menu image",
  },

  /**
   * Sliders
   */
  {
    key: "slider.list",
    method: "GET",
    path: "/content/sliders",
    auth: true,
    description: "Get sliders list",
  },
  {
    key: "slider.detail",
    method: "GET",
    path: "/content/sliders/:id",
    auth: true,
    description: "Get slider detail",
  },
  {
    key: "slider.create",
    method: "POST",
    path: "/content/sliders",
    auth: true,
    description: "Create slider",
  },
  {
    key: "slider.update",
    method: "PATCH",
    path: "/content/sliders/:id",
    auth: true,
    description: "Update slider",
  },
  {
    key: "slider.delete",
    method: "DELETE",
    path: "/content/sliders/:id",
    auth: true,
    description: "Delete slider",
  },
  {
    key: "slider.publish",
    method: "POST",
    path: "/content/sliders/:id/publish",
    auth: true,
    description: "Publish slider",
  },
  {
    key: "slider.unpublish",
    method: "POST",
    path: "/content/sliders/:id/unpublish",
    auth: true,
    description: "Unpublish slider",
  },
  {
    key: "slider.activate",
    method: "POST",
    path: "/content/sliders/:id/activate",
    auth: true,
    description: "Activate slider",
  },
  {
    key: "slider.deactivate",
    method: "POST",
    path: "/content/sliders/:id/deactivate",
    auth: true,
    description: "Deactivate slider",
  },
  {
    key: "slider.reorder",
    method: "POST",
    path: "/content/sliders/reorder",
    auth: true,
    description: "Reorder sliders",
  },
  {
    key: "slider.uploadImage",
    method: "POST",
    path: "/content/sliders/upload-image",
    auth: true,
    contentType: "multipart",
    description: "Upload slider image",
  },
] as const);
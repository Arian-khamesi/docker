import { create } from "zustand";
import { nanoid } from "nanoid";
import { MenuState, MenuItem, MenuType } from "@/types/menu";

function createEmptyItem(type: MenuType): MenuItem {
  const base = {
    id: nanoid(),
    title: "آیتم جدید",
    slug: "/",
    isActive: true,
    order: 0,

    color: "#d93747",

    // تصویر آیتم سطح اول
    image: "",

    children: [],
  };

  if (type === "desktop") {
    return {
      ...base,
      type: "desktop",
    } as MenuItem;
  }

  return {
    ...base,
    type: "mobile",

    // برای توسعه‌های بعدی
    icon: "menu",
  } as MenuItem;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  activeTab: "desktop",

  desktopMenu: [],
  mobileMenu: [],

  selectedItemId: null,

  // تغییرات ذخیره نشده ترتیب
  hasPendingOrderChanges: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedItemId: (id) => set({ selectedItemId: id }),

  setPendingOrderChanges: (value) =>
    set({ hasPendingOrderChanges: value }),

  addMenuItem: (parentId, type) =>
    set((state) => {
      const newItem = createEmptyItem(type);
      const listKey = type === "desktop" ? "desktopMenu" : "mobileMenu";
      const list = [...state[listKey]];

      if (!parentId) {
        newItem.order = list.length;
        list.push(newItem);

        return {
          [listKey]: list,
          selectedItemId: newItem.id,
        } as Partial<MenuState>;
      }

      const addToTree = (items: MenuItem[]): MenuItem[] =>
        items.map((item) => {
          if (item.id === parentId) {
            const children = item.children ? [...item.children] : [];

            newItem.order = children.length;

            children.push(newItem);

            return {
              ...item,
              children,
            };
          }

          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: addToTree(item.children),
            };
          }

          return item;
        });

      return {
        [listKey]: addToTree(list),
        selectedItemId: newItem.id,
      } as Partial<MenuState>;
    }),

  updateMenuItem: (id, updates) =>
    set((state) => {
      const updateTree = (items: MenuItem[]): MenuItem[] =>
        items.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              ...updates,
            };
          }

          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: updateTree(item.children),
            };
          }

          return item;
        });

      return {
        desktopMenu: updateTree(state.desktopMenu),
        mobileMenu: updateTree(state.mobileMenu),
      };
    }),

  deleteMenuItem: (id) =>
    set((state) => {
      const removeFromTree = (items: MenuItem[]): MenuItem[] =>
        items
          .filter((item) => item.id !== id)
          .map((item) =>
            item.children && item.children.length > 0
              ? {
                  ...item,
                  children: removeFromTree(item.children),
                }
              : item
          );

      return {
        desktopMenu: removeFromTree(state.desktopMenu),
        mobileMenu: removeFromTree(state.mobileMenu),
        selectedItemId:
          state.selectedItemId === id
            ? null
            : state.selectedItemId,
      };
    }),

  reorderRootItems: (type, orderedIds) =>
    set((state) => {
      const listKey =
        type === "desktop"
          ? "desktopMenu"
          : "mobileMenu";

      const list = [...state[listKey]];

      const idToItem = new Map(
        list.map((item) => [item.id, item])
      );

      const reordered: MenuItem[] = [];

      orderedIds.forEach((id, index) => {
        const item = idToItem.get(id);

        if (item) {
          reordered.push({
            ...item,
            order: index,
          });
        }
      });

      list.forEach((item) => {
        if (!orderedIds.includes(item.id)) {
          reordered.push({
            ...item,
            order: reordered.length,
          });
        }
      });

      return {
        [listKey]: reordered,

        // کاربر ترتیب را تغییر داده اما هنوز ذخیره نکرده
        hasPendingOrderChanges: true,
      } as Partial<MenuState>;
    }),
}));
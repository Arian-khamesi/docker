// src/types/menu.ts

export type MenuType = "desktop" | "mobile";

export interface MenuItemBase {
  id: string;
  title: string;
  slug: string;

  isActive: boolean;
  order: number;

  color?: string;

  /**
   * تصویر آیتم منو
   * فقط برای آیتم‌های سطح اول استفاده می‌شود
   */
  image?: string;

  children?: MenuItem[];
}

export interface DesktopMenuItem extends MenuItemBase {
  type: "desktop";
}

export interface MobileMenuItem extends MenuItemBase {
  type: "mobile";

  /**
   * برای توسعه‌های آینده
   * (Bottom Navigation / Mobile Navigation)
   */
  icon?: string;
}

export type MenuItem = DesktopMenuItem | MobileMenuItem;

export interface MenuState {
  activeTab: MenuType;

  desktopMenu: MenuItem[];
  mobileMenu: MenuItem[];

  // آیتم انتخاب شده برای Drawer
  selectedItemId: string | null;

  // آیا ترتیب‌ها تغییر کرده‌اند و هنوز ذخیره نشده‌اند؟
  hasPendingOrderChanges: boolean;

  // Actions
  setActiveTab: (tab: MenuType) => void;
  setSelectedItemId: (id: string | null) => void;

  setPendingOrderChanges: (value: boolean) => void;

  addMenuItem: (parentId: string | null, type: MenuType) => void;
  updateMenuItem: (
    id: string,
    updates: Partial<MenuItem>
  ) => void;

  deleteMenuItem: (id: string) => void;

  // Drag & Drop سطح اول
  reorderRootItems: (
    type: MenuType,
    orderedIds: string[]
  ) => void;
}
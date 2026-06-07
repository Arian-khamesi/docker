"use client";

import { useState } from "react";
import { toast } from "sonner";

import { MenuTabs } from "@/components/menu/menu-tabs";
import { MenuList } from "@/components/menu/menu-list";
import { MenuItemDrawer } from "@/components/menu/menu-item-drawer";
import { useMenuStore } from "@/store/menu.store";

export default function MenuManagementPage() {
  const {
    activeTab,
    desktopMenu,
    mobileMenu,
    addMenuItem,
    hasPendingOrderChanges,
    setPendingOrderChanges,
  } = useMenuStore();

  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const currentMenu =
    activeTab === "desktop" ? desktopMenu : mobileMenu;

  const hasItems = currentMenu.length > 0;

  const handleSaveOrder = async () => {
    try {
      setIsSavingOrder(true);

      const payload = {
        desktopMenu,
        mobileMenu,
      };

      // TODO:
      // await menuService.saveOrder(payload);

      console.log("SAVE ORDER PAYLOAD:", payload);

      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      setPendingOrderChanges(false);

      toast.success("ترتیب منوها با موفقیت ذخیره شد");
    } catch (error) {
      console.error(error);

      toast.error("خطا در ذخیره ترتیب منوها");
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background min-h-screen">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-black text-foreground">
          تنظیمات منوی سایت
        </h1>

        <p className="text-sm text-muted-foreground">
          برای مدیریت ساختار منو، نسخه مورد نظر را انتخاب کرده و
          آیتم‌های خود را مدیریت کنید.
        </p>
      </div>

      <MenuTabs />

      {/* Pending Changes Banner */}
      {hasPendingOrderChanges && (
        <div className="mt-6 mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-amber-800">
                تغییرات ذخیره نشده
              </h3>

              <p className="text-xs text-amber-700 mt-1">
                ترتیب آیتم‌های منو تغییر کرده است. برای اعمال
                نهایی، تغییرات را ذخیره کنید.
              </p>
            </div>

            <button
              onClick={handleSaveOrder}
              disabled={isSavingOrder}
              className="shrink-0 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSavingOrder
                ? "در حال ذخیره..."
                : "ذخیره ترتیب"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 bg-card p-6 rounded-[--radius] border border-border shadow-sm min-h-[320px]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
              {activeTab === "desktop" ? "🖥️" : "📱"}
            </div>

            <div>
              <h2 className="text-base font-bold text-foreground">
                {activeTab === "desktop"
                  ? "ویرایش منوی دسکتاپ"
                  : "ویرایش منوی موبایل"}
              </h2>

              <p className="text-xs text-muted-foreground">
                در حال ویرایش{" "}
                {activeTab === "desktop"
                  ? "نسخه دسکتاپ"
                  : "نسخه موبایل"}
              </p>
            </div>
          </div>

          {hasItems && (
            <button
              onClick={() =>
                addMenuItem(null, activeTab)
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-2 px-4 rounded-[--radius] transition-all"
            >
              + افزودن آیتم جدید
            </button>
          )}
        </div>

        {hasItems ? (
          <MenuList />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3 opacity-50">
              ✨
            </div>

            <h3 className="text-base font-bold text-foreground">
              هنوز آیتمی وجود ندارد
            </h3>

            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              برای شروع ساختار منوی خود، اولین آیتم را اضافه
              کنید.
            </p>

            <button
              onClick={() =>
                addMenuItem(null, activeTab)
              }
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-[--radius] transition-all"
            >
              + اضافه کردن اولین آیتم
            </button>
          </div>
        )}
      </div>

      <MenuItemDrawer />

      <div className="mt-6 bg-muted p-4 rounded-[--radius] border border-border">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          راهنمای سریع
        </h4>

        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            آیتم‌های ریشه را می‌توانید با درگ کردن مرتب کنید.
          </li>

          <li>
            برای ویرایش جزئیات (عکس، لینک، رنگ) روی آیتم کلیک
            کنید.
          </li>

          <li>
            پس از تغییر ترتیب آیتم‌ها، برای اعمال نهایی روی
            «ذخیره ترتیب» کلیک کنید.
          </li>
        </ul>
      </div>
    </div>
  );
}
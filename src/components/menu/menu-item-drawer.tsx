"use client";

import { Drawer } from "@/components/ui/drawer";
import { useMenuStore } from "@/store/menu.store";
import { MenuItem } from "@/types/menu";
import { ImageUploader } from "@/components/menu/image-uploader";
import { useMemo } from "react";
import { nanoid } from "nanoid";

export function MenuItemDrawer() {
  const {
    activeTab,
    desktopMenu,
    mobileMenu,
    selectedItemId,
    setSelectedItemId,
    updateMenuItem,
    deleteMenuItem,
  } = useMenuStore();

  const close = () => setSelectedItemId(null);

  // تابع کمکی برای پیدا کردن آیتم در کل درخت
  const findItemById = (items: MenuItem[], id: string): MenuItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const currentMenu = activeTab === "desktop" ? desktopMenu : mobileMenu;
  
  const item = useMemo(() => {
    if (!selectedItemId) return null;
    return findItemById(currentMenu, selectedItemId);
  }, [selectedItemId, currentMenu]);

  // بررسی اینکه آیا آیتم انتخاب شده در سطح ریشه است یا خیر (برای محدودیت ۲ لایه)
  const isRootItem = useMemo(() => {
    if (!selectedItemId) return false;
    return currentMenu.some(m => m.id === selectedItemId);
  }, [selectedItemId, currentMenu]);

  if (!item) return null;

  // تابع افزودن زیرمنو جدید
  const handleAddChild = () => {
    if (!isRootItem) return; // لایه‌ی حفاظتی
    
    const newChild: MenuItem = {
      id: nanoid(),
      title: "زیرمنوی جدید",
      slug: "/",
      isActive: true,
      order: (item.children?.length || 0),
      type: item.type,
      children: []
    };
    updateMenuItem(item.id, {
      children: [...(item.children || []), newChild]
    });
  };

  return (
    <Drawer open={!!selectedItemId} onClose={close} title="تنظیمات و مدیریت زیرمنو">
      <div className="space-y-6 pb-20">
        
        {/* بخش اول: ویرایش اطلاعات اصلی آیتم */}
        <div className="space-y-4 bg-muted/30 p-4 rounded-[--radius] border border-border">
          <h3 className="text-xs font-black text-primary">اطلاعات اصلی آیتم</h3>
          
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground">عنوان آیتم</label>
            <input
              className="w-full rounded-[--radius] border border-border bg-background px-3 py-2 text-sm focus:ring-1 ring-primary outline-none"
              value={item.title}
              placeholder="مثلاً: پوشاک مردانه"
              onChange={(e) => updateMenuItem(item.id, { title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground">لینک (URL)</label>
            <input
              className="w-full rounded-[--radius] border border-border bg-background px-3 py-2 text-sm ltr focus:ring-1 ring-primary outline-none"
              value={item.slug}
              placeholder="/category/men"
              onChange={(e) => updateMenuItem(item.id, { slug: e.target.value })}
            />
          </div>
        </div>

        {/* بخش دوم: تصاویر (مخصوص دسکتاپ) */}
       {/* بخش دوم: تصاویر (مخصوص دسکتاپ) */}
{item.type === "desktop" && isRootItem && (
  <div className="grid grid-cols-2 gap-4">
     <ImageUploader
        label="تصویر مردانه"
        value={(item as any).imageSet?.menImage}
        onChange={(url) =>
          updateMenuItem(
            item.id,
            {
              imageSet: {
                ...((item as any).imageSet || {}),
                menImage: url,
              },
            } as any
          )
        }
     />

     <ImageUploader
        label="تصویر زنانه"
        value={(item as any).imageSet?.womenImage}
        onChange={(url) =>
          updateMenuItem(
            item.id,
            {
              imageSet: {
                ...((item as any).imageSet || {}),
                womenImage: url,
              },
            } as any
          )
        }
     />
  </div>
)}

        {/* بخش سوم: مدیریت زیرمنوها (محدود به ۲ لایه) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-foreground">لیست زیرمنوها</h3>
            {isRootItem && (
              <button 
                onClick={handleAddChild}
                className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold hover:bg-primary hover:text-black transition-all"
              >
                + افزودن زیرمنو
              </button>
            )}
          </div>

          <div className="space-y-2">
            {!isRootItem && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                <p className="text-[10px] text-amber-700">
                  این آیتم خود یک زیرمنو است. امکان ایجاد لایه سوم وجود ندارد.
                </p>
              </div>
            )}

            {item.children && item.children.length > 0 ? (
              item.children.map((child, index) => (
                <div key={child.id} className="flex items-center gap-2 p-2 bg-card border border-border rounded-[--radius] group">
                   <div className="text-muted-foreground text-xs font-mono w-4">{index + 1}</div>
                   <input 
                      className="flex-1 bg-transparent text-xs font-bold outline-none focus:text-primary"
                      value={child.title}
                      onChange={(e) => {
                        const newChildren = [...item.children!];
                        newChildren[index].title = e.target.value;
                        updateMenuItem(item.id, { children: newChildren });
                      }}
                   />
                   <input 
                      className="flex-1 bg-transparent text-[10px] ltr text-muted-foreground outline-none focus:text-primary"
                      value={child.slug}
                      onChange={(e) => {
                        const newChildren = [...item.children!];
                        newChildren[index].slug = e.target.value;
                        updateMenuItem(item.id, { children: newChildren });
                      }}
                   />
                   <button 
                      onClick={() => {
                        const newChildren = item.children!.filter(c => c.id !== child.id);
                        updateMenuItem(item.id, { children: newChildren });
                      }}
                      className="opacity-0 group-hover:opacity-100 text-destructive text-[10px] font-bold transition-all"
                   >
                      حذف
                   </button>
                </div>
              ))
            ) : isRootItem ? (
              <p className="text-[11px] text-muted-foreground text-center py-4 border border-dashed border-border rounded-[--radius]">
                هیچ زیرمنویی ثبت نشده است.
              </p>
            ) : null}
          </div>
        </div>

        {/* بخش پایانی: عملیات‌های خطرناک */}
        <div className="pt-6 border-t border-border flex items-center justify-between">
            <button 
              onClick={() => {
                if(confirm("آیا از حذف کامل این منو و تمام زیرمنوهایش مطمئن هستید؟")) {
                  deleteMenuItem(item.id);
                  close();
                }
              }}
              className="text-[11px] text-destructive font-bold hover:underline"
            >
              حذف کل این آیتم
            </button>
            <button 
              onClick={close}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-[--radius] text-xs font-bold shadow-md shadow-primary/20"
            >
              تایید و ذخیره
            </button>
        </div>
      </div>
    </Drawer>
  );
}

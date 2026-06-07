"use client";

import { useMenuStore } from "@/store/menu.store";
import { MenuItem } from "@/types/menu";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";

// --- کامپوننت مدیریت درگ زیرمنوها (سطح دوم) ---
function SubmenuList({ parentId, children }: { parentId: string; children: MenuItem[] }) {
  const { updateMenuItem } = useMenuStore();

  const handleSubmenuDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = children.findIndex((i) => i.id === active.id);
    const newIndex = children.findIndex((i) => i.id === over.id);
    
    // جابجایی در آرایه محلی فرزندان
    const newChildren = arrayMove(children, oldIndex, newIndex);

    // به‌روزرسانی آیتم والد در استور با لیست فرزندان مرتب شده جدید
    updateMenuItem(parentId, { children: newChildren });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleSubmenuDragEnd}>
      <SortableContext
        items={children.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mr-8 pr-4 border-r-2 border-dashed border-muted-foreground/20 space-y-2 mb-4 mt-1">
          {children.map((child) => (
            <SortableItem
              key={child.id}
              id={child.id}
              isChild={true} // نمایش با استایل زیرمنو
              itemData={{
                title: child.title,
                slug: child.slug,
                isActive: child.isActive,
                color: child.color,
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// --- کامپوننت اصلی لیست منوها ---
export function MenuList() {
  const { activeTab, desktopMenu, mobileMenu, reorderRootItems } = useMenuStore();

  // انتخاب لیست بر اساس تب فعال
  const items = activeTab === "desktop" ? desktopMenu : mobileMenu;

  // سنسورها برای بهبود تجربه لمسی و کلیک (اختیاری)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // جلوگیری از درگ ناخواسته هنگام کلیک ساده
      },
    })
  );

  const handleMainDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    // ذخیره ترتیب جدید در سطح ریشه (Root)
    reorderRootItems(
      activeTab,
      newItems.map((i) => i.id)
    );
  };

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground bg-card border border-dashed border-border rounded-2xl p-6 mt-4">
        هنوز آیتمی برای این منو ثبت نشده است.
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter} 
      onDragEnd={handleMainDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1 mt-4">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col">
              {/* آیتم اصلی (سطح ۱) */}
              <SortableItem
                id={item.id}
                itemData={{
                  title: item.title,
                  slug: item.slug,
                  isActive: item.isActive,
                  color: item.color,
                    image: item.image,
                }}
              />

              {/* رندر زیرمنوها (سطح ۲) با قابلیت درگ داخلی */}
              {item.children && item.children.length > 0 && (
                <SubmenuList parentId={item.id} children={item.children} />
              )}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

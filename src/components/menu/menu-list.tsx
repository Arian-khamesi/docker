"use client";

import { useMenuStore } from "@/store/menu.store";
import {
  MenuItem,
  MenuType,
} from "@/types/menu";
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

// ----------------------
// Submenu List
// ----------------------

function SubmenuList({
  parentId,
  children,
  menuType,
}: {
  parentId: string;
  children: MenuItem[];
  menuType: MenuType;
}){
  const {
    reorderChildItems,
  } = useMenuStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleSubmenuDragEnd = (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = children.findIndex(
      (item) => item.id === active.id
    );

    const newIndex = children.findIndex(
      (item) => item.id === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

   const reorderedChildren = arrayMove(
  children,
  oldIndex,
  newIndex
);

reorderChildItems(
  menuType,
  parentId,
  reorderedChildren.map(
    (child) => child.id
  )
);}

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleSubmenuDragEnd}
    >
      <SortableContext
        items={children.map((child) => child.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mr-8 pr-4 border-r-2 border-dashed border-muted-foreground/20 space-y-2 mb-4 mt-1">
          {children.map((child) => (
            <SortableItem
              key={child.id}
              id={child.id}
              isChild
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

// ----------------------
// Main Menu List
// ----------------------

export function MenuList() {
  const {
    activeTab,
    desktopMenu,
    mobileMenu,
    reorderRootItems,
  } = useMenuStore();

  const items =
    activeTab === "desktop"
      ? desktopMenu
      : mobileMenu;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleMainDragEnd = (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(
      (item) => item.id === active.id
    );

    const newIndex = items.findIndex(
      (item) => item.id === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedItems = arrayMove(
      items,
      oldIndex,
      newIndex
    );

    reorderRootItems(
      activeTab,
      reorderedItems.map((item) => item.id)
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
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1 mt-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col"
            >
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

              {item.children &&
                item.children.length > 0 && (
                  <SubmenuList
                    parentId={item.id}
                    children={item.children}
                     menuType={activeTab}
                  />
                )}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
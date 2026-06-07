"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMenuStore } from "@/store/menu.store";
import {
  GripVertical,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

interface SortableItemProps {
  id: string;
  isChild?: boolean;

  itemData: {
    title: string;
    slug: string;
    isActive?: boolean;
    color?: string;
    image?: string;
  };
}

export function SortableItem({
  id,
  isChild = false,
  itemData,
}: SortableItemProps) {
  const {
    setSelectedItemId,
    deleteMenuItem,
    selectedItemId,
  } = useMenuStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const isSelected = selectedItemId === id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between gap-3 transition-all duration-300 relative overflow-hidden
        ${
          isChild
            ? "bg-secondary/30 border border-border/40 p-3 rounded-xl mb-1.5 ml-1"
            : "bg-card border border-border p-4 rounded-2xl mb-3"
        }
        ${
          isDragging
            ? "opacity-50 scale-[1.02] shadow-xl ring-2 ring-primary/20 z-50"
            : ""
        }
        ${
          isSelected
            ? "border-primary bg-primary/[0.04] shadow-sm"
            : "hover:border-muted-foreground/30 hover:shadow-md hover:shadow-black/[0.01]"
        }
      `}
    >
      {/* Accent Line */}
      <div
        className={`absolute top-0 right-0 bottom-0 ${
          isChild ? "w-1" : "w-1.5"
        }`}
        style={{
          backgroundColor:
            itemData.color || "var(--primary)",
        }}
      />

      <div className="flex items-center gap-3 flex-1 min-w-0 pr-1">
        {/* Drag */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground/40 hover:text-primary hover:bg-primary/5 rounded-lg transition-all flex-shrink-0"
        >
          <GripVertical size={isChild ? 14 : 18} />
        </div>

        {/* Thumbnail فقط برای سطح اول */}
        {!isChild && (
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center flex-shrink-0">
            {itemData.image ? (
              <img
                src={itemData.image}
                alt={itemData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon
                size={16}
                className="text-muted-foreground/50"
              />
            )}
          </div>
        )}

        {/* Content */}
        <div
          onClick={() => setSelectedItemId(id)}
          className="flex-1 min-w-0 cursor-pointer py-0.5"
        >
          <div className="flex items-center gap-2">
            {isChild && (
              <span className="text-muted-foreground/30 text-xs">
                ↳
              </span>
            )}

            <span
              className={`font-bold truncate text-foreground group-hover:text-primary transition-colors
                ${isChild ? "text-xs" : "text-sm"}
              `}
            >
              {itemData.title || "بدون عنوان"}
            </span>

            {itemData.isActive === false && (
              <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
                غیرفعال
              </span>
            )}
          </div>

          <span
            className={`block text-muted-foreground/60 font-mono text-left mt-0.5
              ${isChild ? "text-[9px]" : "text-[10px]"}
            `}
            dir="ltr"
          >
            {itemData.slug}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setSelectedItemId(id)}
          className={`rounded-xl transition-all duration-300
            ${
              isSelected
                ? "bg-primary text-white"
                : "bg-secondary/50 text-muted-foreground hover:bg-primary hover:text-white"
            }
            ${isChild ? "px-2 py-1.5" : "px-3 py-2"}
          `}
        >
          <span className="text-xs font-bold">
            تنظیمات
          </span>
        </button>

        <button
          onClick={() => {
            if (
              confirm(
                "آیا از حذف کامل این منو و تمام زیرمنوهایش مطمئن هستید؟"
              )
            ) {
              deleteMenuItem(id);
              setSelectedItemId(null);
            }
          }}
          className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
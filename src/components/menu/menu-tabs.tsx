"use client";
import { useMenuStore } from "@/store/menu.store";

export function MenuTabs() {
  const { activeTab, setActiveTab } = useMenuStore();

  const tabs: { id: "desktop" | "mobile"; label: string }[] = [
    { id: "desktop", label: "مدیریت منوی دسکتاپ" },
    { id: "mobile", label: "مدیریت منوی موبایل" },
  ];

  return (
    <div className="flex bg-muted p-1 rounded-[--radius] border border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 px-4 rounded-[calc(var(--radius)-4px)] text-sm font-bold transition-all duration-200 
            ${
              activeTab === tab.id
                ? "bg-card text-primary shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

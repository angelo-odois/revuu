"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleItem {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

interface ToggleBlockProps {
  items?: ToggleItem[];
  allowMultiple?: boolean;
  iconPosition?: "left" | "right";
  borderStyle?: "none" | "bordered" | "separated";
}

export function ToggleBlock({
  items = [
    {
      title: "Item 1",
      content: "Conteudo do primeiro item",
      defaultOpen: true,
    },
    { title: "Item 2", content: "Conteudo do segundo item" },
    { title: "Item 3", content: "Conteudo do terceiro item" },
  ],
  allowMultiple = true,
  iconPosition = "right",
  borderStyle = "bordered",
}: ToggleBlockProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    items.forEach((item, index) => {
      if (item.defaultOpen) initial.add(index);
    });
    return initial;
  });

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }
      return newSet;
    });
  };

  const borderClasses = {
    none: "",
    bordered: "border rounded-lg overflow-hidden divide-y",
    separated: "space-y-2",
  };

  const itemClasses = {
    none: "",
    bordered: "",
    separated: "border rounded-lg overflow-hidden",
  };

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Adicione items para exibir
      </div>
    );
  }

  return (
    <div className={cn("py-4", borderClasses[borderStyle])}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        return (
          <div key={index} className={itemClasses[borderStyle]}>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                iconPosition === "left" && "flex-row-reverse justify-end"
              )}
              onClick={() => toggleItem(index)}
            >
              <span className="flex-1 font-medium">{item.title}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div
                className="px-4 pb-4 text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

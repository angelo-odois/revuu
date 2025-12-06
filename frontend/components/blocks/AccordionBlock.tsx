"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, HelpCircle } from "lucide-react";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionBlockProps {
  title?: string;
  subtitle?: string;
  items?: AccordionItem[];
  style?: "simple" | "bordered" | "separated";
  allowMultiple?: boolean;
  defaultOpen?: boolean;
}

export function AccordionBlock({
  title = "",
  subtitle = "",
  items = [],
  style = "bordered",
  allowMultiple = false,
  defaultOpen = false,
}: AccordionBlockProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(
    defaultOpen && items.length > 0 ? new Set([0]) : new Set()
  );

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(index);
      }
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Adicione perguntas e respostas</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div
          className={cn(
            style === "separated" && "space-y-4",
            style === "bordered" && "border rounded-xl overflow-hidden",
            style === "simple" && "divide-y"
          )}
        >
          {items.map((item, index) => {
            const isOpen = openItems.has(index);
            return (
              <div
                key={index}
                className={cn(
                  style === "separated" &&
                    "border rounded-xl overflow-hidden bg-card",
                  style === "bordered" &&
                    index > 0 &&
                    "border-t"
                )}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 text-left transition-colors",
                    "hover:bg-muted/50",
                    isOpen && "bg-muted/30"
                  )}
                >
                  <span className="font-medium pr-4">{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 text-muted-foreground leading-relaxed">
                      {item.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const accordionSchema = {
  title: { type: "string" as const, label: "Titulo" },
  subtitle: { type: "string" as const, label: "Subtitulo" },
  style: {
    type: "select" as const,
    label: "Estilo",
    options: ["simple", "bordered", "separated"],
    default: "bordered",
  },
  allowMultiple: {
    type: "boolean" as const,
    label: "Permitir Multiplos Abertos",
    default: false,
  },
  defaultOpen: {
    type: "boolean" as const,
    label: "Primeiro Aberto por Padrao",
    default: false,
  },
  items: {
    type: "repeater" as const,
    label: "Itens",
    default: [],
    itemSchema: {
      title: { type: "string", label: "Pergunta" },
      content: { type: "richtext", label: "Resposta" },
    },
  },
};

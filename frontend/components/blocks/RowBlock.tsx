"use client";

import { cn } from "@/lib/utils";
import { BlockRenderer } from "./BlockRenderer";

interface NestedBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

interface RowBlockProps {
  layout?: "50-50" | "33-67" | "67-33" | "25-75" | "75-25" | "33-33-33" | "25-50-25";
  gap?: "none" | "small" | "medium" | "large";
  verticalAlign?: "top" | "center" | "bottom" | "stretch";
  reverseOnMobile?: boolean;
  leftBlocks?: NestedBlock[];
  centerBlocks?: NestedBlock[];
  rightBlocks?: NestedBlock[];
}

export function RowBlock({
  layout = "50-50",
  gap = "medium",
  verticalAlign = "top",
  reverseOnMobile = false,
  leftBlocks = [],
  centerBlocks = [],
  rightBlocks = [],
}: RowBlockProps) {
  const gapClasses = {
    none: "gap-0",
    small: "gap-4",
    medium: "gap-6 md:gap-8",
    large: "gap-8 md:gap-12",
  };

  const verticalAlignClasses = {
    top: "items-start",
    center: "items-center",
    bottom: "items-end",
    stretch: "items-stretch",
  };

  const getGridClasses = () => {
    switch (layout) {
      case "50-50":
        return "md:grid-cols-2";
      case "33-67":
        return "md:grid-cols-[1fr_2fr]";
      case "67-33":
        return "md:grid-cols-[2fr_1fr]";
      case "25-75":
        return "md:grid-cols-[1fr_3fr]";
      case "75-25":
        return "md:grid-cols-[3fr_1fr]";
      case "33-33-33":
        return "md:grid-cols-3";
      case "25-50-25":
        return "md:grid-cols-[1fr_2fr_1fr]";
      default:
        return "md:grid-cols-2";
    }
  };

  const isThreeColumn = layout === "33-33-33" || layout === "25-50-25";
  const hasContent = leftBlocks.length > 0 || rightBlocks.length > 0 || (isThreeColumn && centerBlocks.length > 0);

  if (!hasContent) {
    return (
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border text-center">
            <p className="text-muted-foreground">
              Adicione blocos nas colunas esquerda e direita
              {isThreeColumn && " (e central)"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className={cn(
            "grid grid-cols-1",
            getGridClasses(),
            gapClasses[gap],
            verticalAlignClasses[verticalAlign],
            reverseOnMobile && "flex-col-reverse md:flex-row"
          )}
        >
          {/* Left Column */}
          <div className={cn(
            "min-w-0",
            reverseOnMobile && "order-2 md:order-1"
          )}>
            {leftBlocks.length > 0 ? (
              <div className="space-y-4">
                {leftBlocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-border/50 text-center min-h-[100px] flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Coluna Esquerda</span>
              </div>
            )}
          </div>

          {/* Center Column (only for 3-column layouts) */}
          {isThreeColumn && (
            <div className="min-w-0">
              {centerBlocks.length > 0 ? (
                <div className="space-y-4">
                  {centerBlocks.map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-border/50 text-center min-h-[100px] flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Coluna Central</span>
                </div>
              )}
            </div>
          )}

          {/* Right Column */}
          <div className={cn(
            "min-w-0",
            reverseOnMobile && "order-1 md:order-2"
          )}>
            {rightBlocks.length > 0 ? (
              <div className="space-y-4">
                {rightBlocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-border/50 text-center min-h-[100px] flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Coluna Direita</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const rowSchema = {
  layout: {
    type: "select" as const,
    label: "Proporcao",
    options: ["50-50", "33-67", "67-33", "25-75", "75-25", "33-33-33", "25-50-25"],
    default: "50-50",
  },
  gap: {
    type: "select" as const,
    label: "Espacamento",
    options: ["none", "small", "medium", "large"],
    default: "medium",
  },
  verticalAlign: {
    type: "select" as const,
    label: "Alinhamento Vertical",
    options: ["top", "center", "bottom", "stretch"],
    default: "center",
  },
  reverseOnMobile: {
    type: "boolean" as const,
    label: "Inverter no Mobile",
    default: false,
  },
  leftBlocks: {
    type: "blocks" as const,
    label: "Blocos da Esquerda",
    default: [],
  },
  centerBlocks: {
    type: "blocks" as const,
    label: "Blocos do Centro (para layouts de 3 colunas)",
    default: [],
  },
  rightBlocks: {
    type: "blocks" as const,
    label: "Blocos da Direita",
    default: [],
  },
};

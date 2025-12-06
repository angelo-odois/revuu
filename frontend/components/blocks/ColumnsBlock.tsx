"use client";

import { cn } from "@/lib/utils";

interface ColumnItem {
  title?: string;
  content: string;
  icon?: string;
}

interface ColumnsBlockProps {
  columns?: "2" | "3" | "4";
  items?: ColumnItem[];
  gap?: "small" | "medium" | "large";
  style?: "simple" | "cards" | "bordered";
}

export function ColumnsBlock({
  columns = "2",
  items = [],
  gap = "medium",
  style = "simple",
}: ColumnsBlockProps) {
  const columnClasses = {
    "2": "md:grid-cols-2",
    "3": "md:grid-cols-2 lg:grid-cols-3",
    "4": "md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    small: "gap-4",
    medium: "gap-6",
    large: "gap-8",
  };

  const getItemClasses = () => {
    switch (style) {
      case "cards":
        return "p-6 bg-card/50 backdrop-blur border border-border/50 rounded-2xl hover:border-amber-500/50 hover:shadow-lg transition-all duration-300";
      case "bordered":
        return "p-6 border-l-2 border-amber-500/50";
      default:
        return "";
    }
  };

  if (items.length === 0) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border text-center">
            <p className="text-muted-foreground">Add column items</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className={cn("grid grid-cols-1", columnClasses[columns], gapClasses[gap])}>
          {items.map((item, index) => (
            <div key={index} className={getItemClasses()}>
              {item.title && (
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {item.title}
                </h3>
              )}
              <div
                className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const columnsSchema = {
  columns: {
    type: "select" as const,
    label: "Number of Columns",
    options: ["2", "3", "4"],
    default: "2",
  },
  gap: {
    type: "select" as const,
    label: "Gap Size",
    options: ["small", "medium", "large"],
    default: "medium",
  },
  style: {
    type: "select" as const,
    label: "Style",
    options: ["simple", "cards", "bordered"],
    default: "cards",
  },
  items: {
    type: "repeater" as const,
    label: "Column Items",
    default: [],
  },
};

"use client";

import { cn } from "@/lib/utils";
import { useEditorStore } from "@/lib/store";
import { getValueForDevice, ResponsiveValue, DeviceType } from "@/components/editor/ResponsiveControl";

interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

interface StatsBlockProps {
  title?: string;
  subtitle?: string;
  stats?: StatItem[];
  columns?: "2" | "3" | "4" | "5" | ResponsiveValue<string>;
  style?: "simple" | "cards" | "gradient";
}

export function StatsBlock({
  title = "",
  subtitle = "",
  stats = [],
  columns = "4",
  style = "gradient",
}: StatsBlockProps) {
  const previewMode = useEditorStore((state) => state.previewMode);
  const resolvedColumns = getValueForDevice(columns, previewMode as DeviceType) as "2" | "3" | "4" | "5";

  const columnClasses: Record<string, string> = {
    "2": "grid-cols-2",
    "3": "grid-cols-3",
    "4": "grid-cols-4",
    "5": "grid-cols-5",
  };

  const getContainerClasses = () => {
    switch (style) {
      case "gradient":
        return "p-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/20";
      case "cards":
        return "";
      default:
        return "py-8";
    }
  };

  const getStatClasses = () => {
    switch (style) {
      case "cards":
        return "p-6 bg-card/50 backdrop-blur border border-border/50 rounded-xl text-center";
      default:
        return "text-center";
    }
  };

  if (stats.length === 0) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border text-center">
            <p className="text-muted-foreground">Add statistics</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div className={getContainerClasses()}>
          <div className={cn("grid gap-6", columnClasses[resolvedColumns])}>
            {stats.map((stat, index) => (
              <div key={index} className={getStatClasses()}>
                <div className="text-3xl md:text-4xl font-bold text-amber-500">
                  {stat.value}
                  {stat.suffix && <span className="text-xl">{stat.suffix}</span>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const statsSchema = {
  title: { type: "string" as const, label: "Title" },
  subtitle: { type: "string" as const, label: "Subtitle" },
  columns: {
    type: "select" as const,
    label: "Columns",
    options: ["2", "3", "4", "5"],
    default: "4",
  },
  style: {
    type: "select" as const,
    label: "Style",
    options: ["simple", "cards", "gradient"],
    default: "gradient",
  },
  stats: {
    type: "repeater" as const,
    label: "Statistics",
    default: [],
  },
};

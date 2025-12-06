"use client";

import { cn } from "@/lib/utils";
import { Code, Palette, Lightbulb, Rocket, Shield, Zap } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { getValueForDevice, ResponsiveValue, DeviceType } from "@/components/editor/ResponsiveControl";

interface Service {
  title: string;
  description: string;
  icon?: string;
}

interface ServicesGridBlockProps {
  title?: string;
  services?: Service[];
  columns?: "2" | "3" | "4" | ResponsiveValue<string>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  palette: Palette,
  lightbulb: Lightbulb,
  rocket: Rocket,
  shield: Shield,
  zap: Zap,
};

export function ServicesGridBlock({
  title = "My Services",
  services = [],
  columns = "3",
}: ServicesGridBlockProps) {
  const previewMode = useEditorStore((state) => state.previewMode);
  const resolvedColumns = getValueForDevice(columns, previewMode as DeviceType) as "2" | "3" | "4";

  const gridCols: Record<string, string> = {
    "2": "grid-cols-2",
    "3": "grid-cols-3",
    "4": "grid-cols-4",
  };

  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
        )}
        <div className={cn("grid gap-8", gridCols[resolvedColumns])}>
          {services.map((service, index) => {
            const IconComponent = service.icon
              ? iconMap[service.icon] || Code
              : Code;

            return (
              <div
                key={index}
                className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const servicesGridSchema = {
  title: { type: "string" as const, label: "Section Title" },
  services: {
    type: "repeater" as const,
    label: "Services",
    default: [],
  },
  columns: {
    type: "select" as const,
    label: "Columns",
    options: ["2", "3", "4"],
    default: "3",
  },
};

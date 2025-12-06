"use client";

import { cn } from "@/lib/utils";
import {
  Code2, Palette, Lightbulb, Rocket, Shield, Zap,
  BarChart3, Users, Settings, Globe, Database, Layout,
  Smartphone, Cloud, Lock, CheckCircle2, Star, Heart
} from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { getValueForDevice, ResponsiveValue, DeviceType } from "@/components/editor/ResponsiveControl";

interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesBlockProps {
  title?: string;
  subtitle?: string;
  features?: FeatureItem[];
  columns?: "2" | "3" | "4" | ResponsiveValue<string>;
  style?: "cards" | "minimal" | "gradient";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code2,
  palette: Palette,
  lightbulb: Lightbulb,
  rocket: Rocket,
  shield: Shield,
  zap: Zap,
  chart: BarChart3,
  users: Users,
  settings: Settings,
  globe: Globe,
  database: Database,
  layout: Layout,
  smartphone: Smartphone,
  cloud: Cloud,
  lock: Lock,
  check: CheckCircle2,
  star: Star,
  heart: Heart,
};

export function FeaturesBlock({
  title = "",
  subtitle = "",
  features = [],
  columns = "3",
  style = "cards",
}: FeaturesBlockProps) {
  const previewMode = useEditorStore((state) => state.previewMode);
  const resolvedColumns = getValueForDevice(columns, previewMode as DeviceType) as "2" | "3" | "4";

  const columnClasses: Record<string, string> = {
    "2": "grid-cols-2",
    "3": "grid-cols-3",
    "4": "grid-cols-4",
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName.toLowerCase()] || Rocket;
    return Icon;
  };

  const gradientColors = [
    "from-amber-500 to-yellow-500",
    "from-orange-500 to-red-500",
    "from-yellow-500 to-amber-500",
    "from-emerald-500 to-teal-500",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
  ];

  if (features.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 bg-muted/30 rounded-xl border-2 border-dashed border-border text-center">
            <p className="text-muted-foreground">Add features</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={cn("grid grid-cols-1 gap-6", columnClasses[resolvedColumns])}>
          {features.map((feature, index) => {
            const Icon = getIcon(feature.icon || "rocket");
            const gradient = gradientColors[index % gradientColors.length];

            if (style === "minimal") {
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", gradient)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            }

            if (style === "gradient") {
              return (
                <div
                  key={index}
                  className="group relative p-6 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
                >
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br p-2.5 mb-4", gradient)}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            }

            // Default: cards style
            return (
              <div
                key={index}
                className="group p-6 bg-card/50 backdrop-blur border border-border/50 rounded-2xl hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br p-2.5 mb-4 group-hover:scale-110 transition-transform", gradient)}>
                  <Icon className="w-full h-full text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const featuresSchema = {
  title: { type: "string" as const, label: "Title" },
  subtitle: { type: "string" as const, label: "Subtitle" },
  columns: {
    type: "select" as const,
    label: "Columns",
    options: ["2", "3", "4"],
    default: "3",
  },
  style: {
    type: "select" as const,
    label: "Style",
    options: ["cards", "minimal", "gradient"],
    default: "cards",
  },
  features: {
    type: "repeater" as const,
    label: "Features",
    default: [],
  },
};

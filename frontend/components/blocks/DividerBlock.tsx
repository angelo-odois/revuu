"use client";

import { cn } from "@/lib/utils";

interface DividerBlockProps {
  style?: "line" | "dashed" | "dotted" | "gradient" | "wave" | "spacer";
  size?: "small" | "medium" | "large";
  color?: "default" | "primary" | "muted";
  width?: "full" | "wide" | "medium" | "narrow";
  icon?: "none" | "star" | "diamond" | "circle" | "dot";
}

export function DividerBlock({
  style = "line",
  size = "medium",
  color = "default",
  width = "full",
  icon = "none",
}: DividerBlockProps) {
  const sizeClasses = {
    small: style === "spacer" ? "py-4" : "py-6",
    medium: style === "spacer" ? "py-8" : "py-10",
    large: style === "spacer" ? "py-16" : "py-16",
  };

  const widthClasses = {
    full: "w-full",
    wide: "w-3/4",
    medium: "w-1/2",
    narrow: "w-1/4",
  };

  const colorClasses = {
    default: "border-border",
    primary: "border-primary",
    muted: "border-muted-foreground/20",
  };

  const gradientColors = {
    default: "from-transparent via-border to-transparent",
    primary: "from-transparent via-primary to-transparent",
    muted: "from-transparent via-muted-foreground/20 to-transparent",
  };

  if (style === "spacer") {
    return <div className={sizeClasses[size]} />;
  }

  const renderIcon = () => {
    if (icon === "none") return null;

    const iconElement = {
      star: (
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      diamond: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l10 10-10 10L2 12z" />
        </svg>
      ),
      circle: <div className="w-3 h-3 rounded-full bg-current" />,
      dot: <div className="w-2 h-2 rounded-full bg-current" />,
    }[icon];

    return (
      <span
        className={cn(
          "px-4",
          color === "default" && "text-muted-foreground",
          color === "primary" && "text-primary",
          color === "muted" && "text-muted-foreground/50"
        )}
      >
        {iconElement}
      </span>
    );
  };

  if (style === "wave") {
    return (
      <div className={cn("flex items-center justify-center", sizeClasses[size])}>
        <svg
          className={cn(
            widthClasses[width],
            "h-4",
            color === "default" && "text-border",
            color === "primary" && "text-primary",
            color === "muted" && "text-muted-foreground/20"
          )}
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 Q150,0 300,30 T600,30 T900,30 T1200,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }

  if (style === "gradient") {
    return (
      <div className={cn("flex items-center justify-center", sizeClasses[size])}>
        <div
          className={cn(
            "h-px bg-gradient-to-r mx-auto",
            widthClasses[width],
            gradientColors[color]
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", sizeClasses[size])}>
      <div
        className={cn(
          "flex items-center mx-auto",
          widthClasses[width]
        )}
      >
        <div
          className={cn(
            "flex-1 border-t",
            colorClasses[color],
            style === "dashed" && "border-dashed",
            style === "dotted" && "border-dotted"
          )}
        />
        {renderIcon()}
        {icon !== "none" && (
          <div
            className={cn(
              "flex-1 border-t",
              colorClasses[color],
              style === "dashed" && "border-dashed",
              style === "dotted" && "border-dotted"
            )}
          />
        )}
      </div>
    </div>
  );
}

export const dividerSchema = {
  style: {
    type: "select" as const,
    label: "Estilo",
    options: ["line", "dashed", "dotted", "gradient", "wave", "spacer"],
    default: "line",
  },
  size: {
    type: "select" as const,
    label: "Tamanho",
    options: ["small", "medium", "large"],
    default: "medium",
  },
  color: {
    type: "select" as const,
    label: "Cor",
    options: ["default", "primary", "muted"],
    default: "default",
  },
  width: {
    type: "select" as const,
    label: "Largura",
    options: ["full", "wide", "medium", "narrow"],
    default: "full",
  },
  icon: {
    type: "select" as const,
    label: "Icone Central",
    options: ["none", "star", "diamond", "circle", "dot"],
    default: "none",
  },
};

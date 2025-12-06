"use client";

import { cn } from "@/lib/utils";

interface HeroBlockProps {
  // Content
  title?: string;
  subtitle?: string;
  description?: string;
  badge?: string;

  // Title Styling
  titleColor?: "default" | "primary" | "muted" | "white" | "amber" | "custom";
  titleCustomColor?: string;
  titleSize?: "small" | "medium" | "large" | "xlarge";
  titleWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";

  // Subtitle Styling
  subtitleColor?: "default" | "muted" | "primary" | "white" | "custom";
  subtitleCustomColor?: string;
  subtitleSize?: "small" | "base" | "large" | "xl";

  // Description Styling
  descriptionColor?: "default" | "muted" | "primary" | "white" | "custom";
  descriptionCustomColor?: string;
  descriptionSize?: "small" | "base" | "large";

  // Badge Styling
  badgeColor?: "amber" | "primary" | "secondary" | "success" | "destructive";

  // Layout & Background
  background?: string;
  backgroundColor?: "none" | "gradient" | "muted" | "amber" | "primary" | "dark";
  alignment?: "left" | "center" | "right";
  overlayOpacity?: number;
  size?: "small" | "medium" | "large" | "full";
}

export function HeroBlock({
  title = "Welcome",
  subtitle = "",
  description,
  badge = "",
  // Title styling
  titleColor = "default",
  titleCustomColor,
  titleSize = "large",
  titleWeight = "bold",
  // Subtitle styling
  subtitleColor = "muted",
  subtitleCustomColor,
  subtitleSize = "large",
  // Description styling
  descriptionColor = "muted",
  descriptionCustomColor,
  descriptionSize = "base",
  // Badge styling
  badgeColor = "amber",
  // Layout
  background,
  backgroundColor = "none",
  alignment = "center",
  overlayOpacity = 0.5,
  size = "large",
}: HeroBlockProps) {
  const isDarkBg = background || backgroundColor === "dark" || backgroundColor === "primary";

  const sizeClasses = {
    small: "min-h-[40vh] py-16",
    medium: "min-h-[50vh] py-20",
    large: "min-h-[60vh] py-24",
    full: "min-h-screen py-24",
  };

  const titleSizeClasses = {
    small: "text-2xl md:text-3xl lg:text-4xl",
    medium: "text-3xl md:text-4xl lg:text-5xl",
    large: "text-4xl md:text-5xl lg:text-6xl",
    xlarge: "text-5xl md:text-6xl lg:text-7xl",
  };

  const titleWeightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };

  const titleColorClasses = {
    default: isDarkBg ? "text-white" : "text-foreground",
    primary: "text-primary",
    muted: "text-muted-foreground",
    white: "text-white",
    amber: "text-amber-500",
    custom: "",
  };

  const subtitleSizeClasses = {
    small: "text-sm md:text-base",
    base: "text-base md:text-lg",
    large: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl",
  };

  const subtitleColorClasses = {
    default: isDarkBg ? "text-white/90" : "text-foreground",
    muted: isDarkBg ? "text-white/80" : "text-muted-foreground",
    primary: "text-primary",
    white: "text-white",
    custom: "",
  };

  const descriptionSizeClasses = {
    small: "text-sm md:text-base",
    base: "text-base md:text-lg",
    large: "text-lg md:text-xl",
  };

  const descriptionColorClasses = {
    default: isDarkBg ? "text-white/80" : "text-foreground",
    muted: isDarkBg ? "text-white/70" : "text-muted-foreground",
    primary: "text-primary",
    white: "text-white",
    custom: "",
  };

  const badgeColorClasses = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    destructive: "bg-destructive/10 text-destructive",
  };

  const getBackgroundStyle = () => {
    if (background) {
      return {
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {};
  };

  const getBackgroundGradient = () => {
    if (background) return "";
    switch (backgroundColor) {
      case "gradient":
        return "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10";
      case "muted":
        return "bg-muted/30";
      case "amber":
        return "bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20";
      case "primary":
        return "bg-primary text-primary-foreground";
      case "dark":
        return "bg-gray-900 text-white";
      default:
        return "";
    }
  };

  const titleStyle = titleColor === "custom" && titleCustomColor
    ? { color: titleCustomColor }
    : undefined;

  const subtitleStyle = subtitleColor === "custom" && subtitleCustomColor
    ? { color: subtitleCustomColor }
    : undefined;

  const descriptionStyle = descriptionColor === "custom" && descriptionCustomColor
    ? { color: descriptionCustomColor }
    : undefined;

  return (
    <section
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        sizeClasses[size],
        getBackgroundGradient()
      )}
      style={getBackgroundStyle()}
    >
      {/* Background overlay for images */}
      {background && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Decorative elements for non-image backgrounds */}
      {!background && (backgroundColor === "gradient" || backgroundColor === "amber") && (
        <>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[200px] w-[200px] rounded-full bg-amber-500/20 opacity-50 blur-[80px]" />
          <div className="absolute right-1/4 top-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-orange-500/10 opacity-40 blur-[80px]" />
        </>
      )}

      <div
        className={cn(
          "relative z-10 max-w-4xl px-6",
          alignment === "left" && "text-left mr-auto",
          alignment === "center" && "text-center mx-auto",
          alignment === "right" && "text-right ml-auto"
        )}
      >
        {badge && (
          <span className={cn(
            "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6",
            badgeColorClasses[badgeColor]
          )}>
            {badge}
          </span>
        )}

        <h1
          className={cn(
            titleSizeClasses[titleSize],
            titleWeightClasses[titleWeight],
            titleColorClasses[titleColor],
            "tracking-tight"
          )}
          style={titleStyle}
        >
          {title}
        </h1>

        {subtitle && (
          <div
            className={cn(
              "mt-4 max-w-2xl",
              subtitleSizeClasses[subtitleSize],
              subtitleColorClasses[subtitleColor],
              alignment === "center" && "mx-auto"
            )}
            style={subtitleStyle}
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}

        {description && (
          <p
            className={cn(
              "mt-6 max-w-2xl leading-relaxed",
              descriptionSizeClasses[descriptionSize],
              descriptionColorClasses[descriptionColor],
              alignment === "center" && "mx-auto"
            )}
            style={descriptionStyle}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}

export const heroSchema = {
  // Content
  title: { type: "string" as const, label: "Titulo", required: true },
  subtitle: { type: "richtext" as const, label: "Subtitulo" },
  description: { type: "textarea" as const, label: "Descricao" },
  badge: { type: "string" as const, label: "Badge" },

  // Title Styling
  titleColor: {
    type: "select" as const,
    label: "Cor do Titulo",
    options: ["default", "primary", "muted", "white", "amber", "custom"],
    default: "default",
  },
  titleCustomColor: { type: "string" as const, label: "Cor Personalizada do Titulo (hex)" },
  titleSize: {
    type: "select" as const,
    label: "Tamanho do Titulo",
    options: ["small", "medium", "large", "xlarge"],
    default: "large",
  },
  titleWeight: {
    type: "select" as const,
    label: "Peso do Titulo",
    options: ["normal", "medium", "semibold", "bold", "extrabold"],
    default: "bold",
  },

  // Subtitle Styling
  subtitleColor: {
    type: "select" as const,
    label: "Cor do Subtitulo",
    options: ["default", "muted", "primary", "white", "custom"],
    default: "muted",
  },
  subtitleCustomColor: { type: "string" as const, label: "Cor Personalizada do Subtitulo (hex)" },
  subtitleSize: {
    type: "select" as const,
    label: "Tamanho do Subtitulo",
    options: ["small", "base", "large", "xl"],
    default: "large",
  },

  // Description Styling
  descriptionColor: {
    type: "select" as const,
    label: "Cor da Descricao",
    options: ["default", "muted", "primary", "white", "custom"],
    default: "muted",
  },
  descriptionCustomColor: { type: "string" as const, label: "Cor Personalizada da Descricao (hex)" },
  descriptionSize: {
    type: "select" as const,
    label: "Tamanho da Descricao",
    options: ["small", "base", "large"],
    default: "base",
  },

  // Badge Styling
  badgeColor: {
    type: "select" as const,
    label: "Cor do Badge",
    options: ["amber", "primary", "secondary", "success", "destructive"],
    default: "amber",
  },

  // Layout & Background
  background: { type: "image" as const, label: "Imagem de Fundo" },
  backgroundColor: {
    type: "select" as const,
    label: "Cor de Fundo",
    options: ["none", "gradient", "muted", "amber", "primary", "dark"],
    default: "none",
  },
  alignment: {
    type: "select" as const,
    label: "Alinhamento",
    options: ["left", "center", "right"],
    default: "center",
  },
  size: {
    type: "select" as const,
    label: "Altura",
    options: ["small", "medium", "large", "full"],
    default: "large",
  },
  overlayOpacity: {
    type: "number" as const,
    label: "Opacidade do Overlay",
    default: 0.5,
  },
};

"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionBlockProps {
  // Layout
  layout?: "full" | "boxed" | "wide";
  minHeight?: "none" | "small" | "medium" | "large" | "full";
  verticalAlign?: "top" | "center" | "bottom";
  horizontalAlign?: "left" | "center" | "right";

  // Background
  backgroundColor?: "none" | "white" | "muted" | "primary" | "dark" | "gradient" | "amber";
  backgroundImage?: string;
  backgroundOverlay?: "none" | "light" | "dark" | "gradient";
  overlayOpacity?: number;

  // Spacing
  paddingTop?: "none" | "small" | "medium" | "large" | "xlarge";
  paddingBottom?: "none" | "small" | "medium" | "large" | "xlarge";

  // Content - this will be rendered by the parent
  children?: ReactNode;

  // Inner content items (for when not using nested blocks)
  content?: ContentItem[];
}

interface ContentItem {
  type: "heading" | "text" | "button" | "spacer" | "badge";
  // Heading
  headingText?: string;
  headingSize?: "h1" | "h2" | "h3" | "h4";
  headingColor?: "default" | "primary" | "muted" | "white" | "amber" | "custom";
  headingCustomColor?: string;
  headingWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  // Text
  text?: string;
  textColor?: "default" | "muted" | "primary" | "white" | "custom";
  textCustomColor?: string;
  textSize?: "small" | "base" | "large" | "xl";
  // Button
  buttonText?: string;
  buttonUrl?: string;
  buttonStyle?: "primary" | "secondary" | "outline" | "ghost";
  buttonSize?: "small" | "medium" | "large";
  // Spacer
  spacerSize?: "small" | "medium" | "large" | "xlarge";
  // Badge
  badgeText?: string;
  badgeColor?: "amber" | "primary" | "secondary" | "success" | "destructive";
  // Common
  alignment?: "left" | "center" | "right";
  maxWidth?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const paddingClasses = {
  none: "",
  small: "py-8",
  medium: "py-16",
  large: "py-24",
  xlarge: "py-32",
};

const minHeightClasses = {
  none: "",
  small: "min-h-[30vh]",
  medium: "min-h-[50vh]",
  large: "min-h-[70vh]",
  full: "min-h-screen",
};

const layoutClasses = {
  full: "w-full",
  boxed: "max-w-6xl mx-auto px-6",
  wide: "max-w-7xl mx-auto px-6",
};

const backgroundClasses = {
  none: "",
  white: "bg-white dark:bg-gray-950",
  muted: "bg-muted/50",
  primary: "bg-primary text-primary-foreground",
  dark: "bg-gray-900 text-white",
  gradient: "bg-gradient-to-br from-primary/10 via-background to-primary/5",
  amber: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10",
};

export function SectionBlock({
  layout = "boxed",
  minHeight = "none",
  verticalAlign = "center",
  horizontalAlign = "center",
  backgroundColor = "none",
  backgroundImage,
  backgroundOverlay = "none",
  overlayOpacity = 0.5,
  paddingTop = "medium",
  paddingBottom = "medium",
  children,
  content = [],
}: SectionBlockProps) {
  const hasChildren = children || content.length > 0;
  const isDarkBg = backgroundImage || backgroundColor === "dark" || backgroundColor === "primary";

  const renderContentItem = (item: ContentItem, index: number) => {
    const alignmentClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[item.alignment || "center"];

    const maxWidthClasses = {
      none: "",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
    };

    const containerMaxWidth = item.maxWidth ? maxWidthClasses[item.maxWidth] : "";
    const containerAlignment = item.alignment === "center" ? "mx-auto" : item.alignment === "right" ? "ml-auto" : "";

    switch (item.type) {
      case "badge":
        const badgeColors = {
          amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          primary: "bg-primary/10 text-primary",
          secondary: "bg-secondary text-secondary-foreground",
          success: "bg-green-500/10 text-green-600 dark:text-green-400",
          destructive: "bg-destructive/10 text-destructive",
        };
        return (
          <div key={index} className={cn(alignmentClass, containerMaxWidth, containerAlignment)}>
            <span className={cn(
              "inline-block px-4 py-1.5 rounded-full text-sm font-medium",
              badgeColors[item.badgeColor || "amber"]
            )}>
              {item.badgeText}
            </span>
          </div>
        );

      case "heading":
        const HeadingTag = item.headingSize || "h2";
        const headingSizes = {
          h1: "text-4xl md:text-5xl lg:text-6xl",
          h2: "text-3xl md:text-4xl lg:text-5xl",
          h3: "text-2xl md:text-3xl",
          h4: "text-xl md:text-2xl",
        };
        const headingWeights = {
          normal: "font-normal",
          medium: "font-medium",
          semibold: "font-semibold",
          bold: "font-bold",
          extrabold: "font-extrabold",
        };
        const headingColors = {
          default: isDarkBg ? "text-white" : "text-foreground",
          primary: "text-primary",
          muted: "text-muted-foreground",
          white: "text-white",
          amber: "text-amber-500",
          custom: "",
        };
        const headingStyle = item.headingColor === "custom" && item.headingCustomColor
          ? { color: item.headingCustomColor }
          : undefined;

        return (
          <HeadingTag
            key={index}
            className={cn(
              headingSizes[item.headingSize || "h2"],
              headingWeights[item.headingWeight || "bold"],
              headingColors[item.headingColor || "default"],
              "tracking-tight",
              alignmentClass,
              containerMaxWidth,
              containerAlignment
            )}
            style={headingStyle}
          >
            {item.headingText}
          </HeadingTag>
        );

      case "text":
        const textColors = {
          default: isDarkBg ? "text-white/90" : "text-foreground",
          muted: isDarkBg ? "text-white/70" : "text-muted-foreground",
          primary: "text-primary",
          white: "text-white",
          custom: "",
        };
        const textSizes = {
          small: "text-sm",
          base: "text-base",
          large: "text-lg",
          xl: "text-xl",
        };
        const textStyle = item.textColor === "custom" && item.textCustomColor
          ? { color: item.textCustomColor }
          : undefined;

        return (
          <div
            key={index}
            className={cn(
              textSizes[item.textSize || "large"],
              textColors[item.textColor || "muted"],
              alignmentClass,
              containerMaxWidth || "max-w-2xl",
              containerAlignment || (item.alignment === "center" ? "mx-auto" : "")
            )}
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: item.text || "" }}
          />
        );

      case "button":
        const buttonStyles = {
          primary: "bg-primary text-primary-foreground hover:bg-primary/90",
          secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          outline: isDarkBg
            ? "border-2 border-white text-white hover:bg-white/10"
            : "border-2 border-primary text-primary hover:bg-primary/10",
          ghost: "hover:bg-accent hover:text-accent-foreground",
        };
        const buttonSizes = {
          small: "px-4 py-2 text-sm",
          medium: "px-6 py-3",
          large: "px-8 py-4 text-lg",
        };
        return (
          <div key={index} className={cn("flex", {
            "justify-start": item.alignment === "left",
            "justify-center": item.alignment === "center",
            "justify-end": item.alignment === "right",
          })}>
            <a
              href={item.buttonUrl || "#"}
              className={cn(
                "inline-flex items-center justify-center rounded-lg font-semibold transition-all",
                buttonStyles[item.buttonStyle || "primary"],
                buttonSizes[item.buttonSize || "medium"]
              )}
            >
              {item.buttonText}
            </a>
          </div>
        );

      case "spacer":
        const spacerSizes = {
          small: "h-4",
          medium: "h-8",
          large: "h-16",
          xlarge: "h-24",
        };
        return <div key={index} className={spacerSizes[item.spacerSize || "medium"]} />;

      default:
        return null;
    }
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        minHeightClasses[minHeight],
        paddingClasses[paddingTop].replace("py-", "pt-"),
        paddingClasses[paddingBottom].replace("py-", "pb-"),
        !backgroundImage && backgroundClasses[backgroundColor],
        minHeight !== "none" && "flex"
      )}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Background Overlay */}
      {backgroundImage && backgroundOverlay !== "none" && (
        <div
          className={cn(
            "absolute inset-0 z-0",
            backgroundOverlay === "light" && "bg-white",
            backgroundOverlay === "dark" && "bg-black",
            backgroundOverlay === "gradient" && "bg-gradient-to-b from-black/80 via-black/50 to-black/80"
          )}
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Decorative elements */}
      {!backgroundImage && backgroundColor === "gradient" && (
        <>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[200px] w-[200px] rounded-full bg-primary/20 opacity-50 blur-[80px]" />
          <div className="absolute right-1/4 top-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-primary/10 opacity-40 blur-[80px]" />
        </>
      )}

      {!backgroundImage && backgroundColor === "amber" && (
        <>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[200px] w-[200px] rounded-full bg-amber-500/20 opacity-50 blur-[80px]" />
          <div className="absolute right-1/4 top-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-orange-500/10 opacity-40 blur-[80px]" />
        </>
      )}

      {/* Content Container */}
      <div
        className={cn(
          "relative z-10 flex flex-col w-full",
          layoutClasses[layout],
          minHeight !== "none" && "flex-1",
          {
            "justify-start": verticalAlign === "top",
            "justify-center": verticalAlign === "center",
            "justify-end": verticalAlign === "bottom",
          },
          {
            "items-start": horizontalAlign === "left",
            "items-center": horizontalAlign === "center",
            "items-end": horizontalAlign === "right",
          }
        )}
      >
        {/* Render nested children (blocks) if provided */}
        {children}

        {/* Render content items if no children */}
        {!children && content.length > 0 && (
          <div className="flex flex-col gap-4 w-full">
            {content.map((item, index) => renderContentItem(item, index))}
          </div>
        )}

        {/* Empty state for editor */}
        {!hasChildren && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl w-full max-w-2xl">
            <p className="text-muted-foreground">
              Adicione elementos de conteudo
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export const sectionSchema = {
  // Layout
  layout: {
    type: "select" as const,
    label: "Layout",
    options: ["full", "boxed", "wide"],
    default: "boxed",
  },
  minHeight: {
    type: "select" as const,
    label: "Altura Minima",
    options: ["none", "small", "medium", "large", "full"],
    default: "none",
  },
  verticalAlign: {
    type: "select" as const,
    label: "Alinhamento Vertical",
    options: ["top", "center", "bottom"],
    default: "center",
  },
  horizontalAlign: {
    type: "select" as const,
    label: "Alinhamento Horizontal",
    options: ["left", "center", "right"],
    default: "center",
  },
  // Background
  backgroundColor: {
    type: "select" as const,
    label: "Cor de Fundo",
    options: ["none", "white", "muted", "primary", "dark", "gradient", "amber"],
    default: "none",
  },
  backgroundImage: {
    type: "image" as const,
    label: "Imagem de Fundo",
  },
  backgroundOverlay: {
    type: "select" as const,
    label: "Overlay",
    options: ["none", "light", "dark", "gradient"],
    default: "none",
  },
  overlayOpacity: {
    type: "number" as const,
    label: "Opacidade do Overlay",
    default: 0.5,
  },
  // Spacing
  paddingTop: {
    type: "select" as const,
    label: "Padding Superior",
    options: ["none", "small", "medium", "large", "xlarge"],
    default: "medium",
  },
  paddingBottom: {
    type: "select" as const,
    label: "Padding Inferior",
    options: ["none", "small", "medium", "large", "xlarge"],
    default: "medium",
  },
  // Content
  content: {
    type: "repeater" as const,
    label: "Elementos de Conteudo",
    default: [],
    itemSchema: {
      type: {
        type: "select",
        label: "Tipo",
        options: ["badge", "heading", "text", "button", "spacer"],
        default: "heading",
      },
      alignment: {
        type: "select",
        label: "Alinhamento",
        options: ["left", "center", "right"],
        default: "center",
      },
      maxWidth: {
        type: "select",
        label: "Largura Maxima",
        options: ["none", "sm", "md", "lg", "xl", "2xl"],
        default: "none",
      },
      // Badge
      badgeText: { type: "string", label: "Texto do Badge" },
      badgeColor: {
        type: "select",
        label: "Cor do Badge",
        options: ["amber", "primary", "secondary", "success", "destructive"],
        default: "amber",
      },
      // Heading
      headingText: { type: "string", label: "Texto do Titulo" },
      headingSize: {
        type: "select",
        label: "Tamanho do Titulo",
        options: ["h1", "h2", "h3", "h4"],
        default: "h2",
      },
      headingColor: {
        type: "select",
        label: "Cor do Titulo",
        options: ["default", "primary", "muted", "white", "amber", "custom"],
        default: "default",
      },
      headingCustomColor: { type: "string", label: "Cor Personalizada (hex)" },
      headingWeight: {
        type: "select",
        label: "Peso da Fonte",
        options: ["normal", "medium", "semibold", "bold", "extrabold"],
        default: "bold",
      },
      // Text
      text: { type: "richtext", label: "Texto" },
      textColor: {
        type: "select",
        label: "Cor do Texto",
        options: ["default", "muted", "primary", "white", "custom"],
        default: "muted",
      },
      textCustomColor: { type: "string", label: "Cor Personalizada (hex)" },
      textSize: {
        type: "select",
        label: "Tamanho do Texto",
        options: ["small", "base", "large", "xl"],
        default: "large",
      },
      // Button
      buttonText: { type: "string", label: "Texto do Botao" },
      buttonUrl: { type: "string", label: "URL do Botao" },
      buttonStyle: {
        type: "select",
        label: "Estilo do Botao",
        options: ["primary", "secondary", "outline", "ghost"],
        default: "primary",
      },
      buttonSize: {
        type: "select",
        label: "Tamanho do Botao",
        options: ["small", "medium", "large"],
        default: "medium",
      },
      // Spacer
      spacerSize: {
        type: "select",
        label: "Tamanho do Espacador",
        options: ["small", "medium", "large", "xlarge"],
        default: "medium",
      },
    },
  },
};

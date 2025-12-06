"use client";

import { cn } from "@/lib/utils";
import { CSSProperties, ReactNode } from "react";

export interface BlockStyles {
  // Spacing (supports both preset values and pixel numbers)
  paddingTop?: "none" | "small" | "medium" | "large" | "xlarge" | number;
  paddingRight?: "none" | "small" | "medium" | "large" | "xlarge" | number;
  paddingBottom?: "none" | "small" | "medium" | "large" | "xlarge" | number;
  paddingLeft?: "none" | "small" | "medium" | "large" | "xlarge" | number;
  marginTop?: "none" | "small" | "medium" | "large" | "xlarge" | number;
  marginRight?: "none" | "small" | "medium" | "large" | "xlarge" | number;
  marginBottom?: "none" | "small" | "medium" | "large" | "xlarge" | number;
  marginLeft?: "none" | "small" | "medium" | "large" | "xlarge" | number;

  // Background
  backgroundColor?: "none" | "white" | "muted" | "primary" | "dark" | "gradient" | "custom";
  customBgColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: "none" | "light" | "dark" | "gradient";
  backgroundSize?: "cover" | "contain" | "auto";
  backgroundPosition?: "center" | "top" | "bottom" | "left" | "right";

  // Border
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderWidth?: "thin" | "medium" | "thick";
  borderColor?: string;
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

  // Shadow
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";

  // Animation
  animation?: "none" | "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "zoom" | "bounce";

  // Width
  containerWidth?: "full" | "wide" | "normal" | "narrow";
  width?: "auto" | "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4" | "custom";
  customWidth?: number;

  // Typography
  fontFamily?: "inherit" | "sans" | "serif" | "mono";
  fontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  textAlign?: "left" | "center" | "right" | "justify";
  textColor?: "default" | "muted" | "primary" | "white" | "amber" | "custom";
  customTextColor?: string;

  // Position
  position?: "static" | "relative" | "absolute" | "fixed";
  zIndex?: number;

  // Custom
  customClasses?: string;
  elementId?: string;
}

interface BlockWrapperProps {
  children: ReactNode;
  styles?: BlockStyles;
  className?: string;
}

// Convert preset spacing to pixels
const spacingToPixels = (value: string | number | undefined): number | undefined => {
  if (typeof value === "number") return value;
  switch (value) {
    case "none": return 0;
    case "small": return 16;
    case "medium": return 32;
    case "large": return 64;
    case "xlarge": return 96;
    default: return undefined;
  }
};

const backgroundClasses = {
  none: "",
  white: "bg-white dark:bg-gray-950",
  muted: "bg-muted/50",
  primary: "bg-primary text-primary-foreground",
  dark: "bg-gray-900 text-white",
  gradient: "bg-gradient-to-br from-primary/10 via-background to-primary/5",
  custom: "",
};

const borderRadiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

const shadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
};

const borderWidthClasses = {
  thin: "border",
  medium: "border-2",
  thick: "border-4",
};

const containerWidthClasses = {
  full: "max-w-none",
  wide: "max-w-7xl mx-auto",
  normal: "max-w-6xl mx-auto",
  narrow: "max-w-4xl mx-auto",
};

const widthClasses = {
  auto: "",
  full: "w-full",
  "1/2": "w-1/2",
  "1/3": "w-1/3",
  "2/3": "w-2/3",
  "1/4": "w-1/4",
  "3/4": "w-3/4",
  custom: "",
};

const fontFamilyClasses = {
  inherit: "",
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

const fontWeightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

const textAlignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

const textColorClasses = {
  default: "",
  muted: "text-muted-foreground",
  primary: "text-primary",
  white: "text-white",
  amber: "text-amber-500",
  custom: "",
};

const animationClasses = {
  none: "",
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideLeft: "animate-slideLeft",
  slideRight: "animate-slideRight",
  zoom: "animate-zoom",
  bounce: "animate-bounce",
};

const positionClasses = {
  static: "",
  relative: "relative",
  absolute: "absolute",
  fixed: "fixed",
};

export function BlockWrapper({ children, styles = {}, className }: BlockWrapperProps) {
  const {
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    backgroundColor = "none",
    customBgColor,
    backgroundImage,
    backgroundOverlay = "none",
    backgroundSize = "cover",
    backgroundPosition = "center",
    borderStyle = "none",
    borderWidth = "thin",
    borderColor,
    borderRadius = "none",
    shadow = "none",
    animation = "none",
    containerWidth = "normal",
    width = "auto",
    customWidth,
    fontFamily = "inherit",
    fontWeight = "normal",
    textAlign,
    textColor = "default",
    customTextColor,
    position = "static",
    zIndex,
    customClasses,
    elementId,
  } = styles;

  const inlineStyles: CSSProperties = {};

  // Spacing (pixel-based)
  const pt = spacingToPixels(paddingTop);
  const pr = spacingToPixels(paddingRight);
  const pb = spacingToPixels(paddingBottom);
  const pl = spacingToPixels(paddingLeft);
  const mt = spacingToPixels(marginTop);
  const mr = spacingToPixels(marginRight);
  const mb = spacingToPixels(marginBottom);
  const ml = spacingToPixels(marginLeft);

  if (pt !== undefined) inlineStyles.paddingTop = `${pt}px`;
  if (pr !== undefined) inlineStyles.paddingRight = `${pr}px`;
  if (pb !== undefined) inlineStyles.paddingBottom = `${pb}px`;
  if (pl !== undefined) inlineStyles.paddingLeft = `${pl}px`;
  if (mt !== undefined) inlineStyles.marginTop = `${mt}px`;
  if (mr !== undefined) inlineStyles.marginRight = `${mr}px`;
  if (mb !== undefined) inlineStyles.marginBottom = `${mb}px`;
  if (ml !== undefined) inlineStyles.marginLeft = `${ml}px`;

  // Custom background color
  if (backgroundColor === "custom" && customBgColor) {
    inlineStyles.backgroundColor = customBgColor;
  }

  // Background image
  if (backgroundImage) {
    inlineStyles.backgroundImage = `url(${backgroundImage})`;
    inlineStyles.backgroundSize = backgroundSize;
    inlineStyles.backgroundPosition = backgroundPosition;
  }

  // Border color
  if (borderStyle !== "none" && borderColor) {
    inlineStyles.borderColor = borderColor;
  }

  // Custom width
  if (width === "custom" && customWidth !== undefined) {
    inlineStyles.width = `${customWidth}%`;
  }

  // Custom text color
  if (textColor === "custom" && customTextColor) {
    inlineStyles.color = customTextColor;
  }

  // Z-index
  if (zIndex !== undefined && zIndex > 0) {
    inlineStyles.zIndex = zIndex;
  }

  return (
    <div
      id={elementId || undefined}
      className={cn(
        position !== "static" && positionClasses[position],
        backgroundClasses[backgroundColor],
        borderRadius !== "none" && borderRadiusClasses[borderRadius],
        shadow !== "none" && shadowClasses[shadow],
        borderStyle !== "none" && borderWidthClasses[borderWidth],
        borderStyle === "dashed" && "border-dashed",
        borderStyle === "dotted" && "border-dotted",
        animation !== "none" && animationClasses[animation],
        width !== "auto" && width !== "custom" && widthClasses[width],
        fontFamily !== "inherit" && fontFamilyClasses[fontFamily],
        fontWeight !== "normal" && fontWeightClasses[fontWeight],
        textAlign && textAlignClasses[textAlign],
        textColor !== "default" && textColor !== "custom" && textColorClasses[textColor],
        customClasses,
        className
      )}
      style={inlineStyles}
    >
      {/* Background Overlay */}
      {backgroundImage && backgroundOverlay !== "none" && (
        <div
          className={cn(
            "absolute inset-0 z-0",
            borderRadius !== "none" && borderRadiusClasses[borderRadius],
            backgroundOverlay === "light" && "bg-white/60",
            backgroundOverlay === "dark" && "bg-black/60",
            backgroundOverlay === "gradient" && "bg-gradient-to-b from-black/80 via-black/50 to-black/80"
          )}
        />
      )}

      {/* Content */}
      <div className={cn("relative z-10", containerWidthClasses[containerWidth])}>
        {children}
      </div>
    </div>
  );
}

// Style schema that can be added to any block
export const blockStyleSchema = {
  _styles: {
    type: "group" as const,
    label: "Estilos",
    schema: {
      paddingTop: {
        type: "select",
        label: "Padding Superior",
        options: ["none", "small", "medium", "large", "xlarge"],
        default: "medium",
      },
      paddingBottom: {
        type: "select",
        label: "Padding Inferior",
        options: ["none", "small", "medium", "large", "xlarge"],
        default: "medium",
      },
      marginTop: {
        type: "select",
        label: "Margem Superior",
        options: ["none", "small", "medium", "large", "xlarge"],
        default: "none",
      },
      marginBottom: {
        type: "select",
        label: "Margem Inferior",
        options: ["none", "small", "medium", "large", "xlarge"],
        default: "none",
      },
      backgroundColor: {
        type: "select",
        label: "Cor de Fundo",
        options: ["none", "white", "muted", "primary", "dark", "gradient", "custom"],
        default: "none",
      },
      customBgColor: {
        type: "string",
        label: "Cor Personalizada (hex)",
      },
      backgroundImage: {
        type: "image",
        label: "Imagem de Fundo",
      },
      backgroundOverlay: {
        type: "select",
        label: "Overlay da Imagem",
        options: ["none", "light", "dark", "gradient"],
        default: "none",
      },
      borderStyle: {
        type: "select",
        label: "Estilo da Borda",
        options: ["none", "solid", "dashed", "dotted"],
        default: "none",
      },
      borderRadius: {
        type: "select",
        label: "Arredondamento",
        options: ["none", "sm", "md", "lg", "xl", "2xl", "full"],
        default: "none",
      },
      shadow: {
        type: "select",
        label: "Sombra",
        options: ["none", "sm", "md", "lg", "xl", "2xl"],
        default: "none",
      },
      animation: {
        type: "select",
        label: "Animacao",
        options: ["none", "fadeIn", "slideUp", "slideLeft", "slideRight", "zoom", "bounce"],
        default: "none",
      },
      containerWidth: {
        type: "select",
        label: "Largura do Container",
        options: ["full", "wide", "normal", "narrow"],
        default: "normal",
      },
    },
  },
};

// Default style props
export const defaultStyleProps: BlockStyles = {
  paddingTop: "medium",
  paddingBottom: "medium",
  marginTop: "none",
  marginBottom: "none",
  backgroundColor: "none",
  borderStyle: "none",
  borderRadius: "none",
  shadow: "none",
  animation: "none",
  containerWidth: "normal",
};

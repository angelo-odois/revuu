/**
 * Centralized theme configuration
 *
 * This file contains all shared styling configurations used across the application.
 * Import these configurations instead of duplicating class definitions in components.
 */

// Badge color variants for status indicators
export const badgeColors = {
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export type BadgeColor = keyof typeof badgeColors;

// Progress bar / solid color variants
export const barColors = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  green: "bg-green-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
} as const;

export type BarColor = keyof typeof barColors;

// Section background colors
export const backgroundColors = {
  none: "",
  white: "bg-white dark:bg-background",
  muted: "bg-muted",
  primary: "bg-primary",
  dark: "bg-slate-900 text-white",
  gradient: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
  amber: "bg-amber-500",
} as const;

export type BackgroundColor = keyof typeof backgroundColors;

// Background overlay variants
export const overlayColors = {
  none: "",
  light: "bg-white/80",
  dark: "bg-black/60",
  gradient: "bg-gradient-to-t from-black/80 via-black/40 to-transparent",
} as const;

export type OverlayColor = keyof typeof overlayColors;

// Heading text colors
export const headingColors = {
  default: "",
  primary: "text-primary",
  muted: "text-muted-foreground",
  white: "text-white",
  amber: "text-amber-500",
} as const;

export type HeadingColor = keyof typeof headingColors;

// Text colors
export const textColors = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  white: "text-white",
} as const;

export type TextColor = keyof typeof textColors;

// Process step badge colors (different styling than regular badges)
export const processStepColors = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
} as const;

export type ProcessStepColor = keyof typeof processStepColors;

// Primary button styles used throughout the app
export const primaryButtonStyles = {
  base: "bg-amber-500 hover:bg-amber-600 text-white",
  withShadow: "bg-amber-500 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/30",
} as const;

// Spacing configurations
export const paddingY = {
  none: "",
  small: "py-8",
  medium: "py-16",
  large: "py-24",
  xlarge: "py-32",
} as const;

export type PaddingY = keyof typeof paddingY;

// Height configurations
export const minHeights = {
  none: "",
  small: "min-h-[30vh]",
  medium: "min-h-[50vh]",
  large: "min-h-[70vh]",
  full: "min-h-screen",
} as const;

export type MinHeight = keyof typeof minHeights;

// Layout widths
export const layoutWidths = {
  full: "w-full",
  boxed: "max-w-6xl mx-auto px-6",
  wide: "max-w-7xl mx-auto px-6",
} as const;

export type LayoutWidth = keyof typeof layoutWidths;

// Max width constraints
export const maxWidths = {
  none: "",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

export type MaxWidth = keyof typeof maxWidths;

// Heading sizes
export const headingSizes = {
  h1: "text-4xl md:text-5xl lg:text-6xl",
  h2: "text-3xl md:text-4xl lg:text-5xl",
  h3: "text-2xl md:text-3xl",
  h4: "text-xl md:text-2xl",
} as const;

export type HeadingSize = keyof typeof headingSizes;

// Font weights
export const fontWeights = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
} as const;

export type FontWeight = keyof typeof fontWeights;

// Text sizes
export const textSizes = {
  small: "text-sm",
  base: "text-base md:text-lg",
  large: "text-lg md:text-xl",
  xl: "text-xl md:text-2xl",
} as const;

export type TextSize = keyof typeof textSizes;

// Bar heights (for progress bars etc.)
export const barHeights = {
  thin: "h-1",
  medium: "h-2",
  thick: "h-4",
} as const;

export type BarHeight = keyof typeof barHeights;

// Spacer sizes
export const spacerSizes = {
  small: "h-4",
  medium: "h-8",
  large: "h-12",
  xlarge: "h-16",
} as const;

export type SpacerSize = keyof typeof spacerSizes;

// Vertical alignment
export const verticalAligns = {
  top: "justify-start",
  center: "justify-center",
  bottom: "justify-end",
} as const;

export type VerticalAlign = keyof typeof verticalAligns;

// Horizontal alignment
export const horizontalAligns = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
} as const;

export type HorizontalAlign = keyof typeof horizontalAligns;

// Text alignment only (for use within containers)
export const textAlignments = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export type TextAlignment = keyof typeof textAlignments;

// Container alignment
export const containerAlignments = {
  left: "",
  center: "mx-auto",
  right: "ml-auto",
} as const;

export type ContainerAlignment = keyof typeof containerAlignments;

/**
 * Shared block type definitions
 *
 * This file contains type definitions that are shared across block components.
 * Import these types instead of redefining them in each component.
 */

// Color variants for text and elements
export type TextColorVariant = "default" | "muted" | "primary" | "white" | "amber" | "custom";
export type BadgeColorVariant = "amber" | "primary" | "secondary" | "success" | "destructive";
export type BackgroundColorVariant = "none" | "white" | "muted" | "primary" | "dark" | "gradient" | "amber" | "custom";
export type OverlayVariant = "none" | "light" | "dark" | "gradient";

// Size presets
export type SpacingPreset = "none" | "small" | "medium" | "large" | "xlarge";
export type SpacingValue = SpacingPreset | number;

export type SizePreset = "small" | "medium" | "large";
export type ExtendedSizePreset = SizePreset | "xlarge" | "full";

// Typography
export type FontWeightVariant = "normal" | "medium" | "semibold" | "bold" | "extrabold";
export type TextSizePreset = "small" | "base" | "large" | "xl";
export type HeadingSizePreset = "h1" | "h2" | "h3" | "h4";

// Alignment
export type HorizontalAlignment = "left" | "center" | "right";
export type VerticalAlignment = "top" | "center" | "bottom";
export type TextAlignment = HorizontalAlignment | "justify";

// Layout
export type LayoutPreset = "full" | "boxed" | "wide";
export type ContainerWidthPreset = "full" | "wide" | "normal" | "narrow";
export type WidthPreset = "auto" | "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4" | "custom";
export type MaxWidthPreset = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

// Border
export type BorderStyleVariant = "none" | "solid" | "dashed" | "dotted";
export type BorderWidthPreset = "thin" | "medium" | "thick";
export type BorderRadiusPreset = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

// Shadow
export type ShadowPreset = "none" | "sm" | "md" | "lg" | "xl" | "2xl";

// Animation
export type AnimationVariant = "none" | "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "zoom" | "bounce";

// Position
export type PositionVariant = "static" | "relative" | "absolute" | "fixed";

// Background image
export type BackgroundSizeVariant = "cover" | "contain" | "auto";
export type BackgroundPositionVariant = "center" | "top" | "bottom" | "left" | "right";

// Font family
export type FontFamilyVariant = "inherit" | "sans" | "serif" | "mono";

// Common style props shared by many blocks
export interface CommonTextStyleProps {
  textColor?: TextColorVariant;
  customTextColor?: string;
  textSize?: TextSizePreset;
  fontWeight?: FontWeightVariant;
  textAlign?: TextAlignment;
}

export interface CommonSpacingProps {
  paddingTop?: SpacingValue;
  paddingRight?: SpacingValue;
  paddingBottom?: SpacingValue;
  paddingLeft?: SpacingValue;
  marginTop?: SpacingValue;
  marginRight?: SpacingValue;
  marginBottom?: SpacingValue;
  marginLeft?: SpacingValue;
}

export interface CommonBackgroundProps {
  backgroundColor?: BackgroundColorVariant;
  customBgColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: OverlayVariant;
  backgroundSize?: BackgroundSizeVariant;
  backgroundPosition?: BackgroundPositionVariant;
}

export interface CommonBorderProps {
  borderStyle?: BorderStyleVariant;
  borderWidth?: BorderWidthPreset;
  borderColor?: string;
  borderRadius?: BorderRadiusPreset;
}

export interface CommonLayoutProps {
  alignment?: HorizontalAlignment;
  verticalAlign?: VerticalAlignment;
  containerWidth?: ContainerWidthPreset;
  width?: WidthPreset;
  customWidth?: number;
  maxWidth?: MaxWidthPreset;
}

// Block definition used by editor
export interface Block {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

// Block renderer block input
export interface BlockDefinition {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

// Nested blocks support
export interface BlockWithChildren extends Block {
  children?: Block[];
}

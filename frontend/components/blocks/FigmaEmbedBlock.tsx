"use client";

import { cn } from "@/lib/utils";

interface FigmaEmbedBlockProps {
  url?: string;
  height?: "small" | "medium" | "large" | "full";
  hideUI?: boolean;
  allowFullscreen?: boolean;
  caption?: string;
}

function convertToEmbedUrl(url: string): string | null {
  if (!url) return null;

  // If it's already an embed URL, return as is
  if (url.includes("figma.com/embed")) {
    return url;
  }

  // Extract file key from various Figma URL formats
  // Formats:
  // - https://www.figma.com/file/FILE_KEY/...
  // - https://www.figma.com/design/FILE_KEY/...
  // - https://www.figma.com/proto/FILE_KEY/...
  // - https://www.figma.com/board/FILE_KEY/...
  const fileMatch = url.match(/figma\.com\/(file|design|proto|board)\/([a-zA-Z0-9]+)/);

  if (fileMatch) {
    const [, type, fileKey] = fileMatch;
    // For prototypes, we need to preserve that it's a prototype
    if (type === "proto") {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    }
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(`https://www.figma.com/file/${fileKey}`)}`;
  }

  return null;
}

export function FigmaEmbedBlock({
  url = "",
  height = "large",
  hideUI = false,
  allowFullscreen = true,
  caption = "",
}: FigmaEmbedBlockProps) {
  const embedUrl = convertToEmbedUrl(url);

  if (!embedUrl) {
    return (
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="aspect-video bg-muted/50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border gap-2">
            <svg
              className="w-12 h-12 text-muted-foreground"
              viewBox="0 0 38 57"
              fill="currentColor"
            >
              <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
              <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
              <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
              <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
              <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
            </svg>
            <p className="text-muted-foreground">Cole a URL do Figma</p>
          </div>
        </div>
      </section>
    );
  }

  const heightClasses = {
    small: "h-[300px]",
    medium: "h-[450px]",
    large: "h-[600px]",
    full: "h-[800px]",
  };

  const finalUrl = hideUI
    ? `${embedUrl}&hide-ui=1`
    : embedUrl;

  return (
    <section className="py-8 px-6">
      <figure className="max-w-5xl mx-auto">
        <div
          className={cn(
            "relative overflow-hidden bg-muted/30 rounded-xl shadow-xl shadow-black/10",
            heightClasses[height]
          )}
        >
          <iframe
            src={finalUrl}
            className="w-full h-full border-0"
            allowFullScreen={allowFullscreen}
            loading="lazy"
          />
        </div>
        {caption && (
          <figcaption className="mt-4 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}

export const figmaEmbedSchema = {
  url: { type: "string" as const, label: "URL do Figma", required: true },
  height: {
    type: "select" as const,
    label: "Altura",
    options: ["small", "medium", "large", "full"],
    default: "large",
  },
  hideUI: {
    type: "boolean" as const,
    label: "Esconder UI do Figma",
    default: false,
  },
  allowFullscreen: {
    type: "boolean" as const,
    label: "Permitir Fullscreen",
    default: true,
  },
  caption: { type: "string" as const, label: "Legenda" },
};

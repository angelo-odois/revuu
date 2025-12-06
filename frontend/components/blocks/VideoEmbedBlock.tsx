"use client";

import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface VideoEmbedBlockProps {
  url?: string;
  caption?: string;
  size?: "small" | "medium" | "large" | "full";
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16";
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

function getVideoEmbedUrl(url: string, autoplay: boolean, muted: boolean, loop: boolean): string | null {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("mute", "1");
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", youtubeMatch[1]);
    }
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?${params.toString()}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    const params = new URLSearchParams();
    if (autoplay) params.set("autoplay", "1");
    if (muted) params.set("muted", "1");
    if (loop) params.set("loop", "1");
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?${params.toString()}`;
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }

  return null;
}

function getVideoThumbnail(url: string): string | null {
  // YouTube thumbnail
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
  }
  return null;
}

export function VideoEmbedBlock({
  url = "",
  caption = "",
  size = "large",
  aspectRatio = "16:9",
  autoplay = false,
  muted = false,
  loop = false,
}: VideoEmbedBlockProps) {
  const embedUrl = getVideoEmbedUrl(url, autoplay, muted, loop);

  if (!embedUrl) {
    return (
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-muted/50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border gap-2">
            <Play className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">Cole a URL do YouTube, Vimeo ou Loom</p>
          </div>
        </div>
      </section>
    );
  }

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-6xl",
  };

  const aspectClasses = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
  };

  return (
    <section className="py-8 px-6">
      <figure className={cn("mx-auto", sizeClasses[size])}>
        <div
          className={cn(
            "relative overflow-hidden bg-black rounded-xl shadow-xl shadow-black/10",
            aspectClasses[aspectRatio]
          )}
        >
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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

export const videoEmbedSchema = {
  url: { type: "string" as const, label: "URL do Video", required: true },
  caption: { type: "string" as const, label: "Legenda" },
  size: {
    type: "select" as const,
    label: "Tamanho",
    options: ["small", "medium", "large", "full"],
    default: "large",
  },
  aspectRatio: {
    type: "select" as const,
    label: "Proporcao",
    options: ["16:9", "4:3", "1:1", "9:16"],
    default: "16:9",
  },
  autoplay: {
    type: "boolean" as const,
    label: "Autoplay",
    default: false,
  },
  muted: {
    type: "boolean" as const,
    label: "Mudo",
    default: false,
  },
  loop: {
    type: "boolean" as const,
    label: "Loop",
    default: false,
  },
};

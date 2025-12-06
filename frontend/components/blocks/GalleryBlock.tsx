"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, ZoomIn } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { getValueForDevice, ResponsiveValue, DeviceType } from "@/components/editor/ResponsiveControl";

interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface GalleryBlockProps {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  columns?: 2 | 3 | 4 | string | ResponsiveValue<string>;
  gap?: "small" | "medium" | "large" | ResponsiveValue<string>;
  style?: "grid" | "masonry" | "carousel";
  lightbox?: boolean;
  rounded?: boolean;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
}

export function GalleryBlock({
  title,
  subtitle,
  images = [],
  columns = 3,
  gap = "medium",
  style = "grid",
  lightbox = true,
  rounded = true,
  aspectRatio = "square",
}: GalleryBlockProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const previewMode = useEditorStore((state) => state.previewMode);

  // Resolve responsive values
  const resolvedColumns = Number(getValueForDevice(columns, previewMode as DeviceType)) as 2 | 3 | 4;
  const resolvedGap = getValueForDevice(gap, previewMode as DeviceType) as "small" | "medium" | "large";

  const defaultImages: GalleryImage[] = [
    { src: "https://via.placeholder.com/600x600?text=Imagem+1", alt: "Imagem 1" },
    { src: "https://via.placeholder.com/600x600?text=Imagem+2", alt: "Imagem 2" },
    { src: "https://via.placeholder.com/600x600?text=Imagem+3", alt: "Imagem 3" },
    { src: "https://via.placeholder.com/600x600?text=Imagem+4", alt: "Imagem 4" },
    { src: "https://via.placeholder.com/600x600?text=Imagem+5", alt: "Imagem 5" },
    { src: "https://via.placeholder.com/600x600?text=Imagem+6", alt: "Imagem 6" },
  ];

  const displayImages = images.length > 0 ? images : defaultImages;

  const gapClasses: Record<string, string> = {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-6",
  };

  const columnClasses: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  const handleImageClick = (image: GalleryImage) => {
    if (lightbox) {
      setSelectedImage(image);
    }
  };

  return (
    <>
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {(title || subtitle) && (
            <div className="text-center mb-10">
              {title && <h2 className="text-3xl font-bold">{title}</h2>}
              {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
            </div>
          )}

          {style === "masonry" ? (
            <div className={cn("columns-2 md:columns-3 lg:columns-4", gapClasses[resolvedGap])}>
              {displayImages.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "break-inside-avoid mb-4 group cursor-pointer overflow-hidden",
                    rounded && "rounded-lg"
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  <div className="relative">
                    <img
                      src={image.src}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {lightbox && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-sm">{image.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : style === "carousel" ? (
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4">
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex-shrink-0 w-72 group cursor-pointer overflow-hidden",
                      rounded && "rounded-lg"
                    )}
                    onClick={() => handleImageClick(image)}
                  >
                    <div className={cn("relative", aspectClasses[aspectRatio])}>
                      <img
                        src={image.src}
                        alt={image.alt || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {lightbox && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                    {image.caption && (
                      <p className="mt-2 text-sm text-muted-foreground">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={cn("grid", columnClasses[resolvedColumns] || "grid-cols-3", gapClasses[resolvedGap])}>
              {displayImages.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "group cursor-pointer overflow-hidden",
                    rounded && "rounded-lg"
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  <div className={cn("relative", aspectClasses[aspectRatio])}>
                    <img
                      src={image.src}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {lightbox && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-sm">{image.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedImage.src}
            alt={selectedImage.alt || "Gallery image"}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedImage.caption && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 px-4 py-2 rounded-lg">
              {selectedImage.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

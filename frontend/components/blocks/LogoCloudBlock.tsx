"use client";

import { cn } from "@/lib/utils";

interface Logo {
  name: string;
  imageUrl: string;
  link?: string;
}

interface LogoCloudBlockProps {
  title?: string;
  subtitle?: string;
  logos?: Logo[];
  columns?: 3 | 4 | 5 | 6;
  grayscale?: boolean;
  animated?: boolean;
  alignment?: "left" | "center" | "right";
}

export function LogoCloudBlock({
  title = "Empresas que confiam em nos",
  subtitle,
  logos = [],
  columns = 5,
  grayscale = true,
  animated = true,
  alignment = "center",
}: LogoCloudBlockProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const gridCols = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const defaultLogos: Logo[] = [
    { name: "Company 1", imageUrl: "https://via.placeholder.com/150x60?text=Logo+1" },
    { name: "Company 2", imageUrl: "https://via.placeholder.com/150x60?text=Logo+2" },
    { name: "Company 3", imageUrl: "https://via.placeholder.com/150x60?text=Logo+3" },
    { name: "Company 4", imageUrl: "https://via.placeholder.com/150x60?text=Logo+4" },
    { name: "Company 5", imageUrl: "https://via.placeholder.com/150x60?text=Logo+5" },
  ];

  const displayLogos = logos.length > 0 ? logos : defaultLogos;

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className={cn("mb-10", alignmentClasses[alignment])}>
            {title && (
              <h2 className="text-xl font-semibold text-muted-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground/80">{subtitle}</p>
            )}
          </div>
        )}

        <div
          className={cn(
            "grid gap-8 items-center",
            gridCols[columns],
            alignment === "center" && "justify-items-center"
          )}
        >
          {displayLogos.map((logo, index) => {
            const LogoImage = (
              <img
                src={logo.imageUrl}
                alt={logo.name}
                className={cn(
                  "max-h-12 w-auto object-contain transition-all duration-300",
                  grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100",
                  animated && "hover:scale-110"
                )}
              />
            );

            return logo.link ? (
              <a
                key={index}
                href={logo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {LogoImage}
              </a>
            ) : (
              <div key={index}>{LogoImage}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

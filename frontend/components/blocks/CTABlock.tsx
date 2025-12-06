"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CTABlockProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  style?: "simple" | "gradient" | "bordered" | "image";
  alignment?: "left" | "center" | "right";
  backgroundImage?: string;
}

export function CTABlock({
  title = "",
  description = "",
  buttonText = "",
  buttonUrl = "#",
  secondaryButtonText = "",
  secondaryButtonUrl = "#",
  style = "gradient",
  alignment = "center",
  backgroundImage = "",
}: CTABlockProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const buttonAlignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl p-8 md:p-12",
            style === "simple" && "bg-card border",
            style === "gradient" &&
              "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
            style === "bordered" && "border-2 border-primary bg-primary/5",
            style === "image" && "bg-cover bg-center"
          )}
          style={
            style === "image" && backgroundImage
              ? { backgroundImage: `url(${backgroundImage})` }
              : undefined
          }
        >
          {style === "image" && (
            <div className="absolute inset-0 bg-black/60" />
          )}

          <div
            className={cn(
              "relative z-10 flex flex-col gap-6",
              alignmentClasses[alignment]
            )}
          >
            {title && (
              <h2
                className={cn(
                  "text-3xl md:text-4xl font-bold max-w-2xl",
                  style === "image" && "text-white"
                )}
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                className={cn(
                  "text-lg max-w-xl",
                  style === "gradient" && "text-primary-foreground/90",
                  style === "simple" && "text-muted-foreground",
                  style === "bordered" && "text-muted-foreground",
                  style === "image" && "text-white/90"
                )}
              >
                {description}
              </p>
            )}

            {(buttonText || secondaryButtonText) && (
              <div
                className={cn(
                  "flex flex-wrap gap-4",
                  buttonAlignmentClasses[alignment]
                )}
              >
                {buttonText && (
                  <a
                    href={buttonUrl}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                      style === "gradient" &&
                        "bg-white text-primary hover:bg-white/90",
                      style === "simple" &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      style === "bordered" &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      style === "image" &&
                        "bg-white text-gray-900 hover:bg-white/90"
                    )}
                  >
                    {buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}

                {secondaryButtonText && (
                  <a
                    href={secondaryButtonUrl}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                      style === "gradient" &&
                        "bg-transparent border-2 border-white text-white hover:bg-white/10",
                      style === "simple" &&
                        "bg-transparent border-2 border-border text-foreground hover:bg-muted",
                      style === "bordered" &&
                        "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
                      style === "image" &&
                        "bg-transparent border-2 border-white text-white hover:bg-white/10"
                    )}
                  >
                    {secondaryButtonText}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const ctaSchema = {
  title: { type: "string" as const, label: "Titulo", required: true },
  description: { type: "richtext" as const, label: "Descricao" },
  buttonText: { type: "string" as const, label: "Texto do Botao Principal" },
  buttonUrl: { type: "string" as const, label: "URL do Botao Principal" },
  secondaryButtonText: { type: "string" as const, label: "Texto do Botao Secundario" },
  secondaryButtonUrl: { type: "string" as const, label: "URL do Botao Secundario" },
  style: {
    type: "select" as const,
    label: "Estilo",
    options: ["simple", "gradient", "bordered", "image"],
    default: "gradient",
  },
  alignment: {
    type: "select" as const,
    label: "Alinhamento",
    options: ["left", "center", "right"],
    default: "center",
  },
  backgroundImage: { type: "image" as const, label: "Imagem de Fundo (para estilo image)" },
};

"use client";

import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { getValueForDevice, ResponsiveValue, DeviceType } from "@/components/editor/ResponsiveControl";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsBlockProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  columns?: "1" | "2" | "3" | ResponsiveValue<string>;
  style?: "cards" | "minimal" | "bubble";
  showRating?: boolean;
}

export function TestimonialsBlock({
  title = "",
  subtitle = "",
  testimonials = [],
  columns = "2",
  style = "cards",
  showRating = true,
}: TestimonialsBlockProps) {
  const previewMode = useEditorStore((state) => state.previewMode);
  const resolvedColumns = getValueForDevice(columns, previewMode as DeviceType) as "1" | "2" | "3";

  if (testimonials.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <Quote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Adicione depoimentos</p>
          </div>
        </div>
      </section>
    );
  }

  const columnClasses: Record<string, string> = {
    "1": "grid-cols-1 max-w-2xl",
    "2": "grid-cols-2",
    "3": "grid-cols-3",
  };

  const renderStars = (rating: number = 5) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={cn("grid gap-6 mx-auto", columnClasses[resolvedColumns])}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                "relative",
                style === "cards" &&
                  "bg-card border rounded-xl p-6 shadow-sm",
                style === "minimal" && "p-6",
                style === "bubble" &&
                  "bg-muted/50 rounded-2xl p-6 relative before:absolute before:bottom-0 before:left-8 before:w-4 before:h-4 before:bg-muted/50 before:transform before:rotate-45 before:translate-y-2"
              )}
            >
              {style === "cards" && (
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
              )}

              {showRating && testimonial.rating && (
                <div className="mb-4">{renderStars(testimonial.rating)}</div>
              )}

              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-4">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  {testimonial.role && (
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const testimonialsSchema = {
  title: { type: "string" as const, label: "Titulo" },
  subtitle: { type: "string" as const, label: "Subtitulo" },
  columns: {
    type: "select" as const,
    label: "Colunas",
    options: ["1", "2", "3"],
    default: "2",
  },
  style: {
    type: "select" as const,
    label: "Estilo",
    options: ["cards", "minimal", "bubble"],
    default: "cards",
  },
  showRating: {
    type: "boolean" as const,
    label: "Mostrar Avaliacao",
    default: true,
  },
  testimonials: {
    type: "repeater" as const,
    label: "Depoimentos",
    default: [],
    itemSchema: {
      quote: { type: "richtext", label: "Depoimento" },
      name: { type: "string", label: "Nome" },
      role: { type: "string", label: "Cargo/Empresa" },
      avatar: { type: "string", label: "URL do Avatar" },
      rating: {
        type: "select",
        label: "Avaliacao",
        options: ["1", "2", "3", "4", "5"],
        default: "5",
      },
    },
  },
};

"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features?: string;
  buttonText?: string;
  buttonUrl?: string;
  highlighted?: boolean;
}

interface PricingBlockProps {
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
  columns?: "2" | "3" | "4";
  style?: "simple" | "cards" | "gradient";
}

export function PricingBlock({
  title = "",
  subtitle = "",
  plans = [],
  columns = "3",
  style = "cards",
}: PricingBlockProps) {
  if (plans.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Adicione planos de precos</p>
          </div>
        </div>
      </section>
    );
  }

  const columnClasses = {
    "2": "grid-cols-1 md:grid-cols-2 max-w-3xl",
    "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const parseFeatures = (featuresString?: string): Array<{ text: string; included: boolean }> => {
    if (!featuresString) return [];
    return featuresString.split("\n").filter(Boolean).map((line) => {
      const included = !line.startsWith("-");
      const text = line.replace(/^[-+]\s*/, "").trim();
      return { text, included };
    });
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

        <div className={cn("grid gap-6 mx-auto", columnClasses[columns])}>
          {plans.map((plan, index) => {
            const features = parseFeatures(plan.features);
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={index}
                className={cn(
                  "relative flex flex-col rounded-2xl p-6 transition-all",
                  style === "simple" && "border bg-card",
                  style === "cards" && "border bg-card shadow-lg",
                  style === "gradient" && !isHighlighted && "border bg-card",
                  style === "gradient" &&
                    isHighlighted &&
                    "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground border-0",
                  isHighlighted && style !== "gradient" && "border-primary border-2 scale-105"
                )}
              >
                {isHighlighted && (
                  <div
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold",
                      style === "gradient"
                        ? "bg-white text-primary"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={cn(
                      "text-xl font-semibold mb-2",
                      isHighlighted && style === "gradient" && "text-primary-foreground"
                    )}
                  >
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p
                      className={cn(
                        "text-sm",
                        isHighlighted && style === "gradient"
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {plan.description}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      isHighlighted && style === "gradient" && "text-primary-foreground"
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={cn(
                        "text-sm ml-1",
                        isHighlighted && style === "gradient"
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      /{plan.period}
                    </span>
                  )}
                </div>

                {features.length > 0 && (
                  <ul className="space-y-3 mb-6 flex-1">
                    {features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check
                            className={cn(
                              "w-5 h-5 flex-shrink-0",
                              isHighlighted && style === "gradient"
                                ? "text-primary-foreground"
                                : "text-green-500"
                            )}
                          />
                        ) : (
                          <X
                            className={cn(
                              "w-5 h-5 flex-shrink-0",
                              isHighlighted && style === "gradient"
                                ? "text-primary-foreground/50"
                                : "text-muted-foreground"
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            !feature.included &&
                              (isHighlighted && style === "gradient"
                                ? "text-primary-foreground/50"
                                : "text-muted-foreground line-through")
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {plan.buttonText && (
                  <a
                    href={plan.buttonUrl || "#"}
                    className={cn(
                      "w-full text-center py-3 rounded-lg font-semibold transition-all",
                      isHighlighted && style === "gradient"
                        ? "bg-white text-primary hover:bg-white/90"
                        : isHighlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {plan.buttonText}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const pricingSchema = {
  title: { type: "string" as const, label: "Titulo" },
  subtitle: { type: "string" as const, label: "Subtitulo" },
  columns: {
    type: "select" as const,
    label: "Colunas",
    options: ["2", "3", "4"],
    default: "3",
  },
  style: {
    type: "select" as const,
    label: "Estilo",
    options: ["simple", "cards", "gradient"],
    default: "cards",
  },
  plans: {
    type: "repeater" as const,
    label: "Planos",
    default: [],
    itemSchema: {
      name: { type: "string", label: "Nome do Plano" },
      price: { type: "string", label: "Preco" },
      period: { type: "string", label: "Periodo (ex: mes, ano)" },
      description: { type: "string", label: "Descricao" },
      features: {
        type: "richtext",
        label: "Features (uma por linha, use - para desabilitado)",
      },
      buttonText: { type: "string", label: "Texto do Botao" },
      buttonUrl: { type: "string", label: "URL do Botao" },
      highlighted: {
        type: "select",
        label: "Destacar",
        options: ["false", "true"],
        default: "false",
      },
    },
  },
};

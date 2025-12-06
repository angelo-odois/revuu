"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select type
}

interface FormBlockProps {
  title?: string;
  subtitle?: string;
  fields?: FormField[];
  submitText?: string;
  successMessage?: string;
  formAction?: string;
  style?: "default" | "inline" | "minimal";
  alignment?: "left" | "center" | "right";
}

export function FormBlock({
  title = "Entre em Contato",
  subtitle = "Preencha o formulario e entraremos em contato em breve.",
  fields = [],
  submitText = "Enviar Mensagem",
  successMessage = "Mensagem enviada com sucesso! Entraremos em contato em breve.",
  formAction,
  style = "default",
  alignment = "center",
}: FormBlockProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const defaultFields: FormField[] = [
    { name: "name", label: "Nome", type: "text", placeholder: "Seu nome", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "seu@email.com", required: true },
    { name: "phone", label: "Telefone", type: "tel", placeholder: "(00) 00000-0000" },
    { name: "message", label: "Mensagem", type: "textarea", placeholder: "Como podemos ajudar?", required: true },
  ];

  const displayFields = fields.length > 0 ? fields : defaultFields;

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (formAction) {
      // In real implementation, send data to formAction URL
      console.log("Form submitted:", formData);
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({});
  };

  if (isSuccess) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Enviado!</h3>
          <p className="text-muted-foreground">{successMessage}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setIsSuccess(false)}
          >
            Enviar outra mensagem
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className={cn("max-w-2xl mx-auto", style === "inline" && "max-w-4xl")}>
        {(title || subtitle) && (
          <div className={cn("mb-8", alignmentClasses[alignment])}>
            {title && <h2 className="text-3xl font-bold">{title}</h2>}
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "space-y-4",
              style === "inline" && "grid md:grid-cols-2 gap-4 space-y-0"
            )}
          >
            {displayFields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  field.type === "textarea" && style === "inline" && "md:col-span-2"
                )}
              >
                {style !== "minimal" && (
                  <Label htmlFor={field.name} className="mb-2 block">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                )}

                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder={style === "minimal" ? field.label : field.placeholder}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={4}
                    className={cn(style === "minimal" && "bg-muted border-0")}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">{field.placeholder || `Selecione ${field.label}`}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={style === "minimal" ? field.label : field.placeholder}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={cn(style === "minimal" && "bg-muted border-0")}
                  />
                )}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "mt-6",
              alignment === "center" && "text-center",
              alignment === "right" && "text-right"
            )}
          >
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {submitText}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

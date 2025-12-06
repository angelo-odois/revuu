"use client";

import { useMemo } from "react";
import { marked } from "marked";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  content?: string;
  alignment?: "left" | "center" | "right";
}

export function TextBlock({
  content = "<p>Add your content here...</p>",
  alignment = "left",
}: TextBlockProps) {
  const htmlContent = useMemo(() => {
    if (!content) return "";
    // Check if content looks like Markdown (has headers, lists, or bold)
    const isMarkdown = /^#+\s|^\s*[-*]\s|\*\*/.test(content);
    if (isMarkdown) {
      return marked.parse(content, { async: false }) as string;
    }
    return content;
  }, [content]);

  return (
    <section className="py-12 px-6">
      <div
        className={cn(
          "max-w-3xl mx-auto prose prose-lg dark:prose-invert",
          alignment === "left" && "text-left",
          alignment === "center" && "text-center",
          alignment === "right" && "text-right"
        )}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </section>
  );
}

export const textSchema = {
  content: { type: "richtext" as const, label: "Content", required: true },
  alignment: {
    type: "select" as const,
    label: "Alignment",
    options: ["left", "center", "right"],
    default: "left",
  },
};

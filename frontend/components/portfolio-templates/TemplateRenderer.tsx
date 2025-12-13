"use client";

import { getTemplateComponent } from "./index";
import type { PortfolioData } from "./types";

interface TemplateRendererProps {
  portfolio: PortfolioData;
  templateId: string;
  accentColor: string;
  fontFamily: string;
}

export function TemplateRenderer({
  portfolio,
  templateId,
  accentColor,
  fontFamily,
}: TemplateRendererProps) {
  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <TemplateComponent
      portfolio={portfolio}
      accentColor={accentColor}
      fontFamily={fontFamily}
    />
  );
}

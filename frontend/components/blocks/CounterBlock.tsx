"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CounterBlockProps {
  startValue?: number;
  endValue?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  title?: string;
  titleColor?: "default" | "muted" | "primary" | "white";
  numberColor?: "default" | "primary" | "amber" | "white";
  numberSize?: "small" | "medium" | "large" | "xlarge";
  alignment?: "left" | "center" | "right";
}

const numberSizeClasses = {
  small: "text-2xl",
  medium: "text-4xl",
  large: "text-5xl",
  xlarge: "text-6xl",
};

const titleColorClasses = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  white: "text-white",
};

const numberColorClasses = {
  default: "text-foreground",
  primary: "text-primary",
  amber: "text-amber-500",
  white: "text-white",
};

const alignmentClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function CounterBlock({
  startValue = 0,
  endValue = 100,
  duration = 2000,
  prefix = "",
  suffix = "",
  title,
  titleColor = "muted",
  numberColor = "primary",
  numberSize = "large",
  alignment = "center",
}: CounterBlockProps) {
  const [count, setCount] = useState(startValue);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounter();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounter = () => {
    const startTime = Date.now();
    const diff = endValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + diff * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div ref={ref} className={cn("py-8", alignmentClasses[alignment])}>
      <div
        className={cn(
          "font-bold tabular-nums",
          numberSizeClasses[numberSize],
          numberColorClasses[numberColor]
        )}
      >
        {prefix}
        {count.toLocaleString("pt-BR")}
        {suffix}
      </div>
      {title && (
        <p className={cn("mt-2 text-sm", titleColorClasses[titleColor])}>
          {title}
        </p>
      )}
    </div>
  );
}

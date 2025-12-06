"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarBlockProps {
  label?: string;
  value?: number;
  maxValue?: number;
  showPercentage?: boolean;
  barColor?: "primary" | "amber" | "green" | "red" | "blue";
  barHeight?: "thin" | "medium" | "thick";
  animated?: boolean;
}

const barColorClasses = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  green: "bg-green-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

const barHeightClasses = {
  thin: "h-1",
  medium: "h-2",
  thick: "h-4",
};

export function ProgressBarBlock({
  label,
  value = 75,
  maxValue = 100,
  showPercentage = true,
  barColor = "primary",
  barHeight = "medium",
  animated = true,
}: ProgressBarBlockProps) {
  const [currentValue, setCurrentValue] = useState(animated ? 0 : value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const percentage = Math.min((currentValue / maxValue) * 100, 100);

  useEffect(() => {
    if (!animated) {
      setCurrentValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateProgress();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, animated, value]);

  const animateProgress = () => {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(value * easeOut);

      setCurrentValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div ref={ref} className="py-4">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          barHeightClasses[barHeight]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barColorClasses[barColor]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

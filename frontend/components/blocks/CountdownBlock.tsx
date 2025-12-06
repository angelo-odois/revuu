"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownBlockProps {
  targetDate?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
  style?: "boxes" | "inline" | "minimal";
  alignment?: "left" | "center" | "right";
  expiredMessage?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownBlock({
  targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  labels = {
    days: "Dias",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
  },
  style = "boxes",
  alignment = "center",
  expiredMessage = "Tempo esgotado!",
}: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();

      if (difference <= 0) {
        setIsExpired(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  if (isExpired) {
    return (
      <div
        className={cn(
          "py-8 text-center text-xl font-semibold text-muted-foreground",
          alignment === "left" && "text-left",
          alignment === "right" && "text-right"
        )}
      >
        {expiredMessage}
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  const units = [
    { key: "days", value: timeLeft.days, label: labels.days, show: showDays },
    { key: "hours", value: timeLeft.hours, label: labels.hours, show: showHours },
    { key: "minutes", value: timeLeft.minutes, label: labels.minutes, show: showMinutes },
    { key: "seconds", value: timeLeft.seconds, label: labels.seconds, show: showSeconds },
  ].filter((unit) => unit.show);

  if (style === "inline") {
    return (
      <div
        className={cn(
          "py-6 flex items-center gap-2 text-2xl font-bold",
          alignmentClasses[alignment]
        )}
      >
        {units.map((unit, index) => (
          <span key={unit.key}>
            {index > 0 && <span className="text-muted-foreground mx-1">:</span>}
            <span className="tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
          </span>
        ))}
      </div>
    );
  }

  if (style === "minimal") {
    return (
      <div
        className={cn(
          "py-6 flex items-baseline gap-4",
          alignmentClasses[alignment]
        )}
      >
        {units.map((unit) => (
          <div key={unit.key} className="text-center">
            <span className="text-4xl font-bold tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground ml-1">{unit.label}</span>
          </div>
        ))}
      </div>
    );
  }

  // Default: boxes style
  return (
    <div className={cn("py-6 flex gap-4", alignmentClasses[alignment])}>
      {units.map((unit) => (
        <div
          key={unit.key}
          className="flex flex-col items-center p-4 bg-muted rounded-lg min-w-[80px]"
        >
          <span className="text-3xl font-bold tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground mt-1">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

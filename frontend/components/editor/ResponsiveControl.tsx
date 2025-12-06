"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Special value to indicate inheritance (since Radix Select doesn't allow empty strings)
const INHERIT_VALUE = "__inherit__";

export type DeviceType = "desktop" | "tablet" | "mobile";

// Responsive value structure
export interface ResponsiveValue<T> {
  desktop: T;
  tablet?: T;
  mobile?: T;
}

// Check if value is responsive
export function isResponsiveValue<T>(value: unknown): value is ResponsiveValue<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "desktop" in value
  );
}

// Get value for specific device (with fallback to larger screens)
export function getValueForDevice<T>(
  value: T | ResponsiveValue<T>,
  device: DeviceType
): T {
  if (!isResponsiveValue(value)) {
    return value;
  }

  switch (device) {
    case "mobile":
      return value.mobile ?? value.tablet ?? value.desktop;
    case "tablet":
      return value.tablet ?? value.desktop;
    default:
      return value.desktop;
  }
}

// Convert simple value to responsive
export function makeResponsive<T>(value: T): ResponsiveValue<T> {
  return {
    desktop: value,
    tablet: undefined,
    mobile: undefined,
  };
}

interface ResponsiveControlProps {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  type: "number" | "select" | "text";
  options?: string[] | { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  compact?: boolean;
}

export function ResponsiveControl({
  label,
  value,
  onChange,
  type,
  options,
  min,
  max,
  step = 1,
  placeholder,
  compact = false,
}: ResponsiveControlProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>("desktop");
  const [isResponsive, setIsResponsive] = useState(isResponsiveValue(value));

  // Get current responsive value or convert to responsive
  const responsiveValue: ResponsiveValue<unknown> = isResponsiveValue(value)
    ? value
    : { desktop: value };

  const currentValue = getValueForDevice(responsiveValue, activeDevice);

  const handleDeviceChange = (device: DeviceType) => {
    setActiveDevice(device);
  };

  const handleValueChange = (newValue: unknown) => {
    if (!isResponsive) {
      // Non-responsive: just update the value directly
      onChange(newValue);
    } else {
      // Responsive: update the specific device value
      const newResponsiveValue = {
        ...responsiveValue,
        [activeDevice]: newValue,
      };
      onChange(newResponsiveValue);
    }
  };

  const toggleResponsive = () => {
    if (isResponsive) {
      // Convert back to simple value (use desktop value)
      setIsResponsive(false);
      onChange(responsiveValue.desktop);
    } else {
      // Convert to responsive
      setIsResponsive(true);
      const newResponsiveValue: ResponsiveValue<unknown> = {
        desktop: value,
        tablet: undefined,
        mobile: undefined,
      };
      onChange(newResponsiveValue);
    }
  };

  const devices: { key: DeviceType; icon: typeof Monitor; label: string }[] = [
    { key: "desktop", icon: Monitor, label: "Desktop" },
    { key: "tablet", icon: Tablet, label: "Tablet" },
    { key: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  const inputHeight = compact ? "h-7" : "h-8";
  const textSize = compact ? "text-xs" : "text-sm";

  // Check if device has custom value
  const hasCustomValue = (device: DeviceType) => {
    if (!isResponsive) return false;
    if (device === "desktop") return true;
    return responsiveValue[device] !== undefined;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className={textSize}>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isResponsive ? "secondary" : "ghost"}
                size="icon"
                className="h-5 w-5"
                onClick={toggleResponsive}
              >
                <Monitor className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isResponsive ? "Desativar valores responsivos" : "Ativar valores responsivos"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Device Selector (only when responsive) */}
      {isResponsive && (
        <div className="flex gap-0.5 p-0.5 bg-muted rounded-md w-fit">
          {devices.map(({ key, icon: Icon, label: deviceLabel }) => (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeDevice === key ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-6 w-6 relative",
                      hasCustomValue(key) && key !== "desktop" && "after:absolute after:top-0 after:right-0 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full"
                    )}
                    onClick={() => handleDeviceChange(key)}
                  >
                    <Icon className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{deviceLabel}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      {/* Value Input */}
      {type === "number" && (
        <Input
          type="number"
          className={`${inputHeight} ${textSize}`}
          value={currentValue as number ?? ""}
          min={min}
          max={max}
          step={step}
          placeholder={isResponsive && activeDevice !== "desktop" ? `Herdar de ${activeDevice === "mobile" ? "tablet/desktop" : "desktop"}` : placeholder}
          onChange={(e) => {
            const val = e.target.value === "" ? undefined : Number(e.target.value);
            handleValueChange(val);
          }}
        />
      )}

      {type === "text" && (
        <Input
          type="text"
          className={`${inputHeight} ${textSize}`}
          value={(currentValue as string) ?? ""}
          placeholder={isResponsive && activeDevice !== "desktop" ? `Herdar de ${activeDevice === "mobile" ? "tablet/desktop" : "desktop"}` : placeholder}
          onChange={(e) => {
            const val = e.target.value === "" ? undefined : e.target.value;
            handleValueChange(val);
          }}
        />
      )}

      {type === "select" && options && (
        <Select
          value={currentValue === undefined ? INHERIT_VALUE : (currentValue as string)}
          onValueChange={(val) => handleValueChange(val === INHERIT_VALUE ? undefined : val)}
        >
          <SelectTrigger className={`${inputHeight} ${textSize}`}>
            <SelectValue placeholder={isResponsive && activeDevice !== "desktop" ? "Herdar" : "Selecione"} />
          </SelectTrigger>
          <SelectContent>
            {isResponsive && activeDevice !== "desktop" && (
              <SelectItem value={INHERIT_VALUE}>Herdar</SelectItem>
            )}
            {options.map((opt) => {
              const optValue = typeof opt === "string" ? opt : opt.value;
              const optLabel = typeof opt === "string" ? opt : opt.label;
              return (
                <SelectItem key={optValue} value={optValue}>
                  {optLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}

      {/* Indicator for inherited value */}
      {isResponsive && activeDevice !== "desktop" && currentValue === undefined && (
        <p className="text-[10px] text-muted-foreground">
          Herdando valor de {activeDevice === "mobile" && responsiveValue.tablet !== undefined ? "tablet" : "desktop"}
        </p>
      )}
    </div>
  );
}

// Simplified version for select fields
interface ResponsiveSelectProps {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  options: { value: string; label: string }[] | string[];
  compact?: boolean;
}

export function ResponsiveSelect({
  label,
  value,
  onChange,
  options,
  compact = false,
}: ResponsiveSelectProps) {
  return (
    <ResponsiveControl
      label={label}
      value={value}
      onChange={onChange}
      type="select"
      options={options}
      compact={compact}
    />
  );
}

// Simplified version for number fields
interface ResponsiveNumberProps {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  min?: number;
  max?: number;
  step?: number;
  compact?: boolean;
}

export function ResponsiveNumber({
  label,
  value,
  onChange,
  min,
  max,
  step,
  compact = false,
}: ResponsiveNumberProps) {
  return (
    <ResponsiveControl
      label={label}
      value={value}
      onChange={onChange}
      type="number"
      min={min}
      max={max}
      step={step}
      compact={compact}
    />
  );
}

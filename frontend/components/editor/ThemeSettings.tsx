"use client";

import { useState } from "react";
import { Palette, Type, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useEditorStore, ThemeSettings as ThemeSettingsType } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ThemeSettingsProps {
  children: React.ReactNode;
}

const fontOptions = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Open Sans, sans-serif", label: "Open Sans" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Playfair Display, serif", label: "Playfair Display" },
  { value: "Merriweather, serif", label: "Merriweather" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "JetBrains Mono, monospace", label: "JetBrains Mono" },
];

const colorPresets = [
  { name: "Indigo", primary: "#6366f1", secondary: "#f59e0b" },
  { name: "Blue", primary: "#3b82f6", secondary: "#f97316" },
  { name: "Green", primary: "#22c55e", secondary: "#8b5cf6" },
  { name: "Rose", primary: "#f43f5e", secondary: "#14b8a6" },
  { name: "Amber", primary: "#f59e0b", secondary: "#6366f1" },
  { name: "Violet", primary: "#8b5cf6", secondary: "#22c55e" },
];

export function ThemeSettings({ children }: ThemeSettingsProps) {
  const { themeSettings, updateThemeSettings } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<ThemeSettingsType>(themeSettings);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalSettings(themeSettings);
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    updateThemeSettings(localSettings);
    setOpen(false);
  };

  const updateLocal = <K extends keyof ThemeSettingsType>(
    key: K,
    value: ThemeSettingsType[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setLocalSettings((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema Global
          </DialogTitle>
          <DialogDescription>
            Configure cores, tipografia e layout padrao do site.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="colors" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Tipografia
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6 mt-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Presets de Cores</Label>
              <div className="grid grid-cols-6 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border hover:bg-muted transition-colors",
                      localSettings.primaryColor === preset.primary && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primaria</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: localSettings.primaryColor }}
                  />
                  <Input
                    id="primaryColor"
                    type="text"
                    value={localSettings.primaryColor}
                    onChange={(e) => updateLocal("primaryColor", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={localSettings.primaryColor}
                    onChange={(e) => updateLocal("primaryColor", e.target.value)}
                    className="w-10 h-10 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundaria</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: localSettings.secondaryColor }}
                  />
                  <Input
                    id="secondaryColor"
                    type="text"
                    value={localSettings.secondaryColor}
                    onChange={(e) => updateLocal("secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={localSettings.secondaryColor}
                    onChange={(e) => updateLocal("secondaryColor", e.target.value)}
                    className="w-10 h-10 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: localSettings.backgroundColor }}
                  />
                  <Input
                    id="backgroundColor"
                    type="text"
                    value={localSettings.backgroundColor}
                    onChange={(e) => updateLocal("backgroundColor", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={localSettings.backgroundColor}
                    onChange={(e) => updateLocal("backgroundColor", e.target.value)}
                    className="w-10 h-10 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Cor do Texto</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: localSettings.textColor }}
                  />
                  <Input
                    id="textColor"
                    type="text"
                    value={localSettings.textColor}
                    onChange={(e) => updateLocal("textColor", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="color"
                    value={localSettings.textColor}
                    onChange={(e) => updateLocal("textColor", e.target.value)}
                    className="w-10 h-10 p-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fonte do Corpo</Label>
                <Select
                  value={localSettings.fontFamily}
                  onValueChange={(value) => updateLocal("fontFamily", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fonte dos Titulos</Label>
                <Select
                  value={localSettings.headingFontFamily}
                  onValueChange={(value) => updateLocal("headingFontFamily", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Tamanho Base da Fonte</Label>
                <span className="text-sm font-medium">{localSettings.baseFontSize}px</span>
              </div>
              <Slider
                value={[localSettings.baseFontSize]}
                onValueChange={([value]) => updateLocal("baseFontSize", value)}
                min={12}
                max={24}
                step={1}
              />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">Preview</p>
              <div
                style={{
                  fontFamily: localSettings.fontFamily,
                  fontSize: `${localSettings.baseFontSize}px`,
                  color: localSettings.textColor,
                }}
              >
                <h3
                  style={{
                    fontFamily: localSettings.headingFontFamily,
                    fontSize: `${localSettings.baseFontSize * 1.5}px`,
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  Titulo de Exemplo
                </h3>
                <p>
                  Este e um paragrafo de exemplo para demonstrar como o texto
                  sera exibido com as configuracoes atuais de tipografia.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label>Arredondamento de Bordas</Label>
              <Select
                value={localSettings.borderRadius}
                onValueChange={(value) =>
                  updateLocal("borderRadius", value as ThemeSettingsType["borderRadius"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="sm">Pequeno</SelectItem>
                  <SelectItem value="md">Medio</SelectItem>
                  <SelectItem value="lg">Grande</SelectItem>
                  <SelectItem value="xl">Extra Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Largura do Container</Label>
              <Select
                value={localSettings.containerWidth}
                onValueChange={(value) =>
                  updateLocal("containerWidth", value as ThemeSettingsType["containerWidth"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Estreito (960px)</SelectItem>
                  <SelectItem value="normal">Normal (1152px)</SelectItem>
                  <SelectItem value="wide">Largo (1280px)</SelectItem>
                  <SelectItem value="full">Largura Total</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(["none", "sm", "md", "lg"] as const).map((radius) => (
                <button
                  key={radius}
                  onClick={() => updateLocal("borderRadius", radius)}
                  className={cn(
                    "h-20 border-2 transition-colors flex items-center justify-center",
                    radius === "none" && "rounded-none",
                    radius === "sm" && "rounded-sm",
                    radius === "md" && "rounded-md",
                    radius === "lg" && "rounded-lg",
                    localSettings.borderRadius === radius
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="text-xs capitalize">{radius === "none" ? "Nenhum" : radius.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Tema</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

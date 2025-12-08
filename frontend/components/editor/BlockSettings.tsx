"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  Contrast,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Unlink,
} from "lucide-react";
import { Block, useEditorStore } from "@/lib/store";
import { blockRegistry } from "@/components/blocks";
import { BlockStyles } from "@/components/blocks/BlockWrapper";
import { ResponsiveControl } from "./ResponsiveControl";

// Field categories for organizing into tabs
type FieldCategory = "content" | "style" | "advanced";

interface FieldSchema {
  type: string;
  label: string;
  tab?: FieldCategory;
  options?: string[] | number[];
  default?: unknown;
  required?: boolean;
  itemSchema?: Record<string, FieldSchema>;
  responsive?: boolean;
}

// Fields that should be responsive by default
const responsiveFields = new Set(["columns", "gap"]);

// Style schema configuration
const styleSchema = {
  // Typography
  fontFamily: {
    label: "Familia",
    options: ["inherit", "sans", "serif", "mono"],
  },
  fontSize: {
    label: "Tamanho",
    options: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"],
  },
  fontWeight: {
    label: "Peso",
    options: ["normal", "medium", "semibold", "bold", "extrabold"],
  },
  textColor: {
    label: "Cor do Texto",
    options: ["default", "muted", "primary", "white", "amber", "custom"],
  },
  // Background
  backgroundColor: {
    label: "Cor de Fundo",
    options: ["none", "white", "muted", "primary", "dark", "gradient", "custom"],
  },
  backgroundOverlay: {
    label: "Overlay",
    options: ["none", "light", "dark", "gradient"],
  },
  // Border & Shadow
  borderStyle: {
    label: "Estilo",
    options: ["none", "solid", "dashed", "dotted"],
  },
  borderRadius: {
    label: "Arredondamento",
    options: ["none", "sm", "md", "lg", "xl", "2xl", "full"],
  },
  shadow: {
    label: "Sombra",
    options: ["none", "sm", "md", "lg", "xl", "2xl"],
  },
  // Animation
  animation: {
    label: "Animacao",
    options: ["none", "fadeIn", "slideUp", "slideLeft", "slideRight", "zoom", "bounce"],
  },
};

// Advanced schema configuration
const advancedSchema = {
  paddingTop: { label: "Superior", min: 0, max: 200, step: 4 },
  paddingRight: { label: "Direita", min: 0, max: 200, step: 4 },
  paddingBottom: { label: "Inferior", min: 0, max: 200, step: 4 },
  paddingLeft: { label: "Esquerda", min: 0, max: 200, step: 4 },
  marginTop: { label: "Superior", min: -100, max: 200, step: 4 },
  marginRight: { label: "Direita", min: -100, max: 200, step: 4 },
  marginBottom: { label: "Inferior", min: -100, max: 200, step: 4 },
  marginLeft: { label: "Esquerda", min: -100, max: 200, step: 4 },
  width: {
    label: "Largura",
    options: ["auto", "full", "1/2", "1/3", "2/3", "1/4", "3/4", "custom"],
  },
  position: {
    label: "Posicao",
    options: ["static", "relative", "absolute", "fixed"],
  },
  zIndex: { label: "Z-Index", min: 0, max: 100, step: 1 },
};

interface BlockSettingsProps {
  block: Block;
}

export function BlockSettings({ block }: BlockSettingsProps) {
  const { updateBlock } = useEditorStore();
  const blockConfig = blockRegistry[block.type as keyof typeof blockRegistry];
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [marginLinked, setMarginLinked] = useState(true);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      updateBlock(block.id, { [key]: value });
    },
    [block.id, updateBlock]
  );

  const handleStyleChange = useCallback(
    (styleKey: string, value: unknown) => {
      const currentStyles = (block.props._styles as BlockStyles) || {};
      updateBlock(block.id, {
        _styles: { ...currentStyles, [styleKey]: value },
      });
    },
    [block.id, block.props._styles, updateBlock]
  );

  const handleLinkedPaddingChange = useCallback(
    (value: number) => {
      const currentStyles = (block.props._styles as BlockStyles) || {};
      updateBlock(block.id, {
        _styles: {
          ...currentStyles,
          paddingTop: value,
          paddingRight: value,
          paddingBottom: value,
          paddingLeft: value,
        },
      });
    },
    [block.id, block.props._styles, updateBlock]
  );

  const handleLinkedMarginChange = useCallback(
    (value: number) => {
      const currentStyles = (block.props._styles as BlockStyles) || {};
      updateBlock(block.id, {
        _styles: {
          ...currentStyles,
          marginTop: value,
          marginRight: value,
          marginBottom: value,
          marginLeft: value,
        },
      });
    },
    [block.id, block.props._styles, updateBlock]
  );

  if (!blockConfig) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Unknown block type</p>
      </div>
    );
  }

  // Categorize fields by tab
  const categorizeFields = () => {
    const content: [string, FieldSchema][] = [];
    const style: [string, FieldSchema][] = [];

    Object.entries(blockConfig.schema).forEach(([key, field]) => {
      const f = field as FieldSchema;
      // Style fields (colors, sizes, weights)
      if (
        key.toLowerCase().includes("color") ||
        key.toLowerCase().includes("size") ||
        key.toLowerCase().includes("weight") ||
        (key.toLowerCase().includes("style") && !key.includes("button"))
      ) {
        style.push([key, f]);
      }
      // Layout fields
      else if (
        key === "alignment" ||
        key === "backgroundColor" ||
        key === "background" ||
        key === "overlayOpacity"
      ) {
        style.push([key, f]);
      }
      // Content fields (everything else)
      else {
        content.push([key, f]);
      }
    });

    return { content, style };
  };

  const { content: contentFields, style: styleFields } = categorizeFields();
  const currentStyles = (block.props._styles as BlockStyles) || {};

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">Editar {blockConfig.name}</h3>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          <TabsTrigger
            value="content"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Conteudo
          </TabsTrigger>
          <TabsTrigger
            value="style"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <Contrast className="h-4 w-4 mr-2" />
            Estilo
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
          >
            <Settings className="h-4 w-4 mr-2" />
            Avancado
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="flex-1 overflow-auto m-0">
          <div className="p-4 space-y-4">
            {contentFields.map(([key, field]) => (
              <FieldRenderer
                key={key}
                fieldKey={key}
                field={field}
                value={block.props[key]}
                onChange={(value) => handleChange(key, value)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="flex-1 overflow-auto m-0">
          <div className="p-4 space-y-4">
            {/* Block-specific style fields */}
            {styleFields.length > 0 && (
              <CollapsibleSection title="Estilo do Bloco" defaultOpen>
                <div className="space-y-3">
                  {styleFields.map(([key, field]) => (
                    <FieldRenderer
                      key={key}
                      fieldKey={key}
                      field={field}
                      value={block.props[key]}
                      onChange={(value) => handleChange(key, value)}
                      compact
                    />
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Typography */}
            <CollapsibleSection title="Tipografia">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{styleSchema.fontFamily.label}</Label>
                    <Select
                      value={(currentStyles.fontFamily as string) || "inherit"}
                      onValueChange={(v) => handleStyleChange("fontFamily", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleSchema.fontFamily.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{styleSchema.fontWeight.label}</Label>
                    <Select
                      value={(currentStyles.fontWeight as string) || "normal"}
                      onValueChange={(v) => handleStyleChange("fontWeight", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleSchema.fontWeight.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="space-y-1">
                  <Label className="text-xs">Alinhamento</Label>
                  <div className="flex gap-1">
                    {[
                      { value: "left", icon: AlignLeft },
                      { value: "center", icon: AlignCenter },
                      { value: "right", icon: AlignRight },
                      { value: "justify", icon: AlignJustify },
                    ].map(({ value, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={(currentStyles.textAlign as string) === value ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleStyleChange("textAlign", value)}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-1">
                  <Label className="text-xs">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Select
                      value={(currentStyles.textColor as string) || "default"}
                      onValueChange={(v) => handleStyleChange("textColor", v)}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleSchema.textColor.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentStyles.textColor === "custom" && (
                      <Input
                        type="color"
                        className="h-8 w-12 p-1"
                        value={(currentStyles.customTextColor as string) || "#000000"}
                        onChange={(e) => handleStyleChange("customTextColor", e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Background */}
            <CollapsibleSection title="Fundo">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">{styleSchema.backgroundColor.label}</Label>
                  <div className="flex gap-2">
                    <Select
                      value={(currentStyles.backgroundColor as string) || "none"}
                      onValueChange={(v) => handleStyleChange("backgroundColor", v)}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleSchema.backgroundColor.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentStyles.backgroundColor === "custom" && (
                      <Input
                        type="color"
                        className="h-8 w-12 p-1"
                        value={(currentStyles.customBgColor as string) || "#ffffff"}
                        onChange={(e) => handleStyleChange("customBgColor", e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Imagem de Fundo</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="URL da imagem"
                    value={(currentStyles.backgroundImage as string) || ""}
                    onChange={(e) => handleStyleChange("backgroundImage", e.target.value)}
                  />
                </div>

                {currentStyles.backgroundImage && (
                  <div className="space-y-1">
                    <Label className="text-xs">{styleSchema.backgroundOverlay.label}</Label>
                    <Select
                      value={(currentStyles.backgroundOverlay as string) || "none"}
                      onValueChange={(v) => handleStyleChange("backgroundOverlay", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleSchema.backgroundOverlay.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Border & Shadow */}
            <CollapsibleSection title="Borda e Sombra">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{styleSchema.borderStyle.label}</Label>
                    <Select
                      value={(currentStyles.borderStyle as string) || "none"}
                      onValueChange={(v) => handleStyleChange("borderStyle", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleSchema.borderStyle.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{styleSchema.borderRadius.label}</Label>
                    <Select
                      value={(currentStyles.borderRadius as string) || "none"}
                      onValueChange={(v) => handleStyleChange("borderRadius", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styleSchema.borderRadius.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {currentStyles.borderStyle && currentStyles.borderStyle !== "none" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Cor da Borda</Label>
                    <Input
                      type="color"
                      className="h-8 w-full"
                      value={(currentStyles.borderColor as string) || "#e5e7eb"}
                      onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs">{styleSchema.shadow.label}</Label>
                  <Select
                    value={(currentStyles.shadow as string) || "none"}
                    onValueChange={(v) => handleStyleChange("shadow", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styleSchema.shadow.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>

            {/* Animation */}
            <CollapsibleSection title="Animacao">
              <div className="space-y-1">
                <Label className="text-xs">{styleSchema.animation.label}</Label>
                <Select
                  value={(currentStyles.animation as string) || "none"}
                  onValueChange={(v) => handleStyleChange("animation", v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styleSchema.animation.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleSection>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="flex-1 overflow-auto m-0">
          <div className="p-4 space-y-4">
            {/* Margin */}
            <CollapsibleSection title="Margem" defaultOpen>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">px</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setMarginLinked(!marginLinked)}
                  >
                    {marginLinked ? <Link className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
                  </Button>
                </div>
                {marginLinked ? (
                  <div className="space-y-2">
                    <Slider
                      value={[(currentStyles.marginTop as number) || 0]}
                      onValueChange={([v]) => handleLinkedMarginChange(v)}
                      min={-100}
                      max={200}
                      step={4}
                    />
                    <div className="text-center text-xs text-muted-foreground">
                      {(currentStyles.marginTop as number) || 0}px
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(["Top", "Right", "Bottom", "Left"] as const).map((side) => {
                      const key = `margin${side}` as keyof typeof advancedSchema;
                      return (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs">{advancedSchema[key].label}</Label>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              className="h-7 text-xs"
                              value={(currentStyles[key] as number) || 0}
                              onChange={(e) => handleStyleChange(key, parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Padding */}
            <CollapsibleSection title="Preenchimento" defaultOpen>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">px</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setPaddingLinked(!paddingLinked)}
                  >
                    {paddingLinked ? <Link className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
                  </Button>
                </div>
                {paddingLinked ? (
                  <div className="space-y-2">
                    <Slider
                      value={[(currentStyles.paddingTop as number) || 0]}
                      onValueChange={([v]) => handleLinkedPaddingChange(v)}
                      min={0}
                      max={200}
                      step={4}
                    />
                    <div className="text-center text-xs text-muted-foreground">
                      {(currentStyles.paddingTop as number) || 0}px
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(["Top", "Right", "Bottom", "Left"] as const).map((side) => {
                      const key = `padding${side}` as keyof typeof advancedSchema;
                      return (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs">{advancedSchema[key].label}</Label>
                          <Input
                            type="number"
                            className="h-7 text-xs"
                            value={(currentStyles[key] as number) || 0}
                            onChange={(e) => handleStyleChange(key, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Width */}
            <CollapsibleSection title="Largura">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">{advancedSchema.width.label}</Label>
                  <Select
                    value={(currentStyles.width as string) || "auto"}
                    onValueChange={(v) => handleStyleChange("width", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {advancedSchema.width.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentStyles.width === "custom" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[(currentStyles.customWidth as number) || 100]}
                        onValueChange={([v]) => handleStyleChange("customWidth", v)}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {(currentStyles.customWidth as number) || 100}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Position */}
            <CollapsibleSection title="Posicao">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">{advancedSchema.position.label}</Label>
                  <Select
                    value={(currentStyles.position as string) || "static"}
                    onValueChange={(v) => handleStyleChange("position", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {advancedSchema.position.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Z-Index</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={(currentStyles.zIndex as number) || 0}
                    onChange={(e) => handleStyleChange("zIndex", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* CSS Classes */}
            <CollapsibleSection title="CSS Personalizado">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Classes CSS</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="classe1 classe2"
                    value={(currentStyles.customClasses as string) || ""}
                    onChange={(e) => handleStyleChange("customClasses", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">ID do Elemento</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="meu-elemento"
                    value={(currentStyles.elementId as string) || ""}
                    onChange={(e) => handleStyleChange("elementId", e.target.value)}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-0 hover:bg-transparent h-8"
        >
          <span className="text-xs font-medium">{title}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

// Field Renderer Component
interface FieldRendererProps {
  fieldKey: string;
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  compact?: boolean;
}

function FieldRenderer({ fieldKey, field, value, onChange, compact }: FieldRendererProps) {
  const inputHeight = compact ? "h-8" : "h-9";
  const textSize = compact ? "text-xs" : "text-sm";

  // Check if this field should be responsive
  const isResponsive = field.responsive || responsiveFields.has(fieldKey);

  switch (field.type) {
    case "string":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldKey} className={textSize}>{field.label}</Label>
          <Input
            id={fieldKey}
            className={`${inputHeight} ${textSize}`}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldKey} className={textSize}>{field.label}</Label>
          <textarea
            id={fieldKey}
            className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 ${textSize} ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "richtext":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldKey} className={textSize}>{field.label}</Label>
          <textarea
            id={fieldKey}
            className={`flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 ${textSize} ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldKey} className={textSize}>{field.label}</Label>
          <Input
            id={fieldKey}
            type="number"
            step="0.1"
            min="0"
            max="1"
            className={`${inputHeight} ${textSize}`}
            value={(value as number) ?? field.default ?? 0}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
        </div>
      );

    case "select":
      // Use ResponsiveControl for responsive fields
      if (isResponsive) {
        const options = field.options?.map((opt) => ({
          value: String(opt),
          label: String(opt),
        })) || [];

        return (
          <ResponsiveControl
            label={field.label}
            value={value}
            onChange={onChange}
            type="select"
            options={options}
            compact={compact}
          />
        );
      }

      return (
        <div className="space-y-1.5">
          <Label className={textSize}>{field.label}</Label>
          <Select
            value={String(value ?? field.default ?? "")}
            onValueChange={onChange}
          >
            <SelectTrigger className={`${inputHeight} ${textSize}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={String(option)} value={String(option)}>
                  {String(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "image":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={fieldKey} className={textSize}>{field.label}</Label>
          <Input
            id={fieldKey}
            placeholder="URL da imagem"
            className={`${inputHeight} ${textSize}`}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {typeof value === 'string' && value && (
            <img
              src={value}
              alt="Preview"
              className="w-full h-24 object-cover rounded-md"
            />
          )}
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={fieldKey}
            checked={(value as boolean) ?? field.default ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-input bg-background"
          />
          <Label htmlFor={fieldKey} className={`${textSize} cursor-pointer`}>
            {field.label}
          </Label>
        </div>
      );

    case "repeater":
      return (
        <RepeaterField
          fieldKey={fieldKey}
          field={field}
          items={(value as Record<string, unknown>[]) || []}
          onChange={onChange}
        />
      );

    case "blocks":
      return (
        <NestedBlocksField
          fieldKey={fieldKey}
          field={field}
          blocks={(value as Block[]) || []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}

// Repeater Field Component
interface RepeaterFieldProps {
  fieldKey: string;
  field: FieldSchema;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
}

function RepeaterField({ fieldKey, field, items, onChange }: RepeaterFieldProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    if (field.itemSchema) {
      Object.entries(field.itemSchema).forEach(([key, schema]) => {
        newItem[key] = schema.default ?? "";
      });
    }
    const newItems = [...items, newItem];
    onChange(newItems);
    setOpenItems((prev) => new Set([...prev, newItems.length - 1]));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (index: number, itemKey: string, itemValue: unknown) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [itemKey]: itemValue } : item
    );
    onChange(newItems);
  };

  const moveItem = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onChange(newItems);
  };

  const getItemTitle = (item: Record<string, unknown>, index: number) => {
    return (item.title as string) || (item.name as string) || (item.value as string) || (item.headingText as string) || (item.text as string)?.substring(0, 20) || `Item ${index + 1}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{field.label}</Label>
        <Button variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-md">
            Nenhum item. Clique em "Adicionar".
          </div>
        ) : (
          items.map((item, index) => (
            <Collapsible
              key={index}
              open={openItems.has(index)}
              onOpenChange={() => toggleItem(index)}
            >
              <div className="border rounded-md bg-muted/30">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="flex-1 text-xs font-medium truncate">
                      {getItemTitle(item, index)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, "up");
                        }}
                        disabled={index === 0}
                      >
                        <ChevronDown className="h-3 w-3 rotate-180" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, "down");
                        }}
                        disabled={index === items.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(index);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          openItems.has(index) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-2 pt-0 space-y-2 border-t">
                    {field.itemSchema &&
                      Object.entries(field.itemSchema).map(([itemKey, itemField]) => (
                        <FieldRenderer
                          key={itemKey}
                          fieldKey={`${fieldKey}-${index}-${itemKey}`}
                          field={itemField}
                          value={item[itemKey]}
                          onChange={(v) => updateItem(index, itemKey, v)}
                          compact
                        />
                      ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}

// Nested Blocks Field Component - allows adding blocks inside other blocks
interface NestedBlocksFieldProps {
  fieldKey: string;
  field: FieldSchema;
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

function NestedBlocksField({ fieldKey, field, blocks, onChange }: NestedBlocksFieldProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  // Filter out layout blocks to prevent infinite nesting
  const availableBlocks = Object.entries(blockRegistry).filter(
    ([key]) => key !== "row" && key !== "columns" && key !== "section"
  );

  const addBlock = (blockType: string) => {
    const blockConfig = blockRegistry[blockType as keyof typeof blockRegistry];
    if (!blockConfig) return;

    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      type: blockType,
      props: { ...blockConfig.defaultProps },
    };

    onChange([...blocks, newBlock]);
    setShowBlockPicker(false);
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  const moveBlock = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    onChange(newBlocks);
  };

  const getBlockName = (block: Block) => {
    const config = blockRegistry[block.type as keyof typeof blockRegistry];
    return config?.name || block.type;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{field.label}</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBlockPicker(!showBlockPicker)}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Adicionar Bloco
        </Button>
      </div>

      {/* Block Picker */}
      {showBlockPicker && (
        <div className="border rounded-md p-2 bg-muted/30 max-h-[200px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-1">
            {availableBlocks.map(([key, config]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                className="h-8 text-xs justify-start"
                onClick={() => addBlock(key)}
              >
                {config.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Block List */}
      <div className="space-y-1">
        {blocks.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-md">
            Nenhum bloco. Clique em "Adicionar Bloco".
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className="flex items-center gap-2 p-2 border rounded-md bg-card"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="flex-1 text-xs font-medium truncate">
                {getBlockName(block)}
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => moveBlock(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronDown className="h-3 w-3 rotate-180" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => moveBlock(index, "down")}
                  disabled={index === blocks.length - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive hover:text-destructive"
                  onClick={() => removeBlock(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

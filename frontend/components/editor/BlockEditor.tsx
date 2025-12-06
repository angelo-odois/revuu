"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Undo,
  Redo,
  Save,
  Eye,
  Layers,
  LayoutTemplate,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Clipboard,
  PanelLeft,
  PanelLeftClose,
  Settings,
  Palette,
  History,
  FileDown,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useEditorStore, Block, PreviewMode } from "@/lib/store";
import { SortableBlock } from "./SortableBlock";
import { BlockPicker } from "./BlockPicker";
import { BlockSettings } from "./BlockSettings";
import { Navigator } from "./Navigator";
import { TemplatesLibrary } from "./TemplatesLibrary";
import { PageSettings } from "./PageSettings";
import { ThemeSettings } from "./ThemeSettings";
import { VersionHistory } from "./VersionHistory";
import { SaveTemplateDialog } from "./SaveTemplateDialog";
import { blockRegistry } from "@/components/blocks";
import { cn } from "@/lib/utils";

interface BlockEditorProps {
  onSave: (blocks: Block[]) => void;
  onPreview: () => void;
  saving?: boolean;
}

const previewWidths: Record<PreviewMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function BlockEditor({ onSave, onPreview, saving }: BlockEditorProps) {
  const {
    blocks,
    selectedBlockId,
    clipboard,
    previewMode,
    addBlock,
    removeBlock,
    moveBlock,
    selectBlock,
    copyBlock,
    pasteBlock,
    duplicateBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    setBlocks,
    saveVersion,
    isBlockVisible,
    setPreviewMode,
  } = useEditorStore();

  const [showNavigator, setShowNavigator] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're not in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + C = Copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedBlockId) {
        e.preventDefault();
        copyBlock(selectedBlockId);
      }

      // Ctrl/Cmd + V = Paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboard) {
        e.preventDefault();
        pasteBlock();
      }

      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        redo();
      }

      // Ctrl/Cmd + D = Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedBlockId) {
        e.preventDefault();
        duplicateBlock(selectedBlockId);
      }

      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      // Delete/Backspace = Remove selected block
      if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockId) {
        e.preventDefault();
        removeBlock(selectedBlockId);
      }

      // Escape = Deselect
      if (e.key === "Escape" && selectedBlockId) {
        e.preventDefault();
        selectBlock(null);
      }

      // Arrow Up/Down = Navigate blocks
      if (e.key === "ArrowUp" && selectedBlockId) {
        e.preventDefault();
        const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId);
        if (currentIndex > 0) {
          selectBlock(blocks[currentIndex - 1].id);
        }
      }

      if (e.key === "ArrowDown" && selectedBlockId) {
        e.preventDefault();
        const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId);
        if (currentIndex < blocks.length - 1) {
          selectBlock(blocks[currentIndex + 1].id);
        }
      }

      // ? = Show shortcuts
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedBlockId,
    clipboard,
    blocks,
    copyBlock,
    pasteBlock,
    undo,
    redo,
    duplicateBlock,
    removeBlock,
    selectBlock,
  ]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        moveBlock(oldIndex, newIndex);
      }
    },
    [blocks, moveBlock]
  );

  const handleAddBlock = useCallback(
    (type: string) => {
      const blockConfig = blockRegistry[type as keyof typeof blockRegistry];
      if (!blockConfig) return;

      const newBlock: Block = {
        id: uuidv4(),
        type,
        props: { ...blockConfig.defaultProps },
      };

      addBlock(newBlock);
      selectBlock(newBlock.id);
    },
    [addBlock, selectBlock]
  );

  const handleSelectTemplate = useCallback(
    (templateBlocks: Block[]) => {
      // Save current version before applying template
      if (blocks.length > 0) {
        saveVersion("Antes do template");
      }
      // Replace all blocks with template blocks
      setBlocks(templateBlocks);
      if (templateBlocks.length > 0) {
        selectBlock(templateBlocks[0].id);
      }
    },
    [setBlocks, selectBlock, blocks, saveVersion]
  );

  const handleSave = useCallback(() => {
    saveVersion(); // Auto-save version
    onSave(blocks);
  }, [blocks, onSave, saveVersion]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="flex h-full">
      {/* Navigator Panel */}
      {showNavigator && (
        <div className="w-64 border-r bg-card flex flex-col">
          <Navigator />
        </div>
      )}

      {/* Editor Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-card border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Navigator Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNavigator(!showNavigator)}
                  >
                    {showNavigator ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <PanelLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showNavigator ? "Esconder Navegador" : "Mostrar Navegador"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Undo/Redo */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo()}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo()}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refazer (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Copy/Paste */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedBlockId && copyBlock(selectedBlockId)}
                    disabled={!selectedBlockId}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copiar (Ctrl+C)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={pasteBlock}
                    disabled={!clipboard}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Colar (Ctrl+V)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Preview Mode */}
            <div className="flex items-center bg-muted rounded-md p-0.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === "desktop" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPreviewMode("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === "tablet" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPreviewMode("tablet")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === "mobile" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPreviewMode("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Shortcuts Help */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShortcuts((prev) => !prev)}
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Atalhos (?)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            {/* Page Settings */}
            <PageSettings>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </PageSettings>

            {/* Theme Settings */}
            <ThemeSettings>
              <Button variant="ghost" size="sm">
                <Palette className="h-4 w-4" />
              </Button>
            </ThemeSettings>

            {/* Version History */}
            <VersionHistory>
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4" />
              </Button>
            </VersionHistory>

            <Separator orientation="vertical" className="h-6" />

            {/* Save as Template */}
            <SaveTemplateDialog>
              <Button variant="ghost" size="sm">
                <FileDown className="h-4 w-4" />
              </Button>
            </SaveTemplateDialog>

            {/* Templates Library */}
            <TemplatesLibrary onSelectTemplate={handleSelectTemplate}>
              <Button variant="outline" size="sm">
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </TemplatesLibrary>

            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Shortcuts Panel */}
        {showShortcuts && (
          <div className="bg-muted/50 border-b px-4 py-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl+S</kbd>
                <span className="text-muted-foreground">Salvar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl+Z</kbd>
                <span className="text-muted-foreground">Desfazer</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl+D</kbd>
                <span className="text-muted-foreground">Duplicar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl+C/V</kbd>
                <span className="text-muted-foreground">Copiar/Colar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Del</kbd>
                <span className="text-muted-foreground">Remover</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Esc</kbd>
                <span className="text-muted-foreground">Desselecionar</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">↑/↓</kbd>
                <span className="text-muted-foreground">Navegar</span>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <div
            className={cn(
              "mx-auto bg-card rounded-lg shadow-sm border min-h-[600px] transition-all duration-300",
              previewMode !== "desktop" && "border-primary/50"
            )}
            style={{
              maxWidth: previewWidths[previewMode],
              width: "100%",
            }}
          >
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                <Layers className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="mb-4 text-lg">Comece adicionando um bloco</p>
                <div className="flex gap-2">
                  <BlockPicker onSelect={handleAddBlock}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Bloco
                    </Button>
                  </BlockPicker>
                  <TemplatesLibrary onSelectTemplate={handleSelectTemplate}>
                    <Button variant="outline">
                      <LayoutTemplate className="h-4 w-4 mr-2" />
                      Usar Template
                    </Button>
                  </TemplatesLibrary>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isSelected={block.id === selectedBlockId}
                      isHidden={!isBlockVisible(block.id)}
                      onSelect={() => selectBlock(block.id)}
                      onRemove={() => removeBlock(block.id)}
                    />
                  ))}
                </SortableContext>

                <div className="p-4 border-t border-dashed">
                  <BlockPicker onSelect={handleAddBlock}>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Bloco
                    </Button>
                  </BlockPicker>
                </div>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      <div className="w-80 border-l bg-card overflow-auto">
        {selectedBlock ? (
          <BlockSettings block={selectedBlock} />
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Selecione um bloco para editar suas propriedades</p>
          </div>
        )}
      </div>
    </div>
  );
}

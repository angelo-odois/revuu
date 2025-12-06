"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  GripVertical,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Block, useEditorStore } from "@/lib/store";
import { blockRegistry } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NavigatorItemProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
}

function NavigatorItem({
  block,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onToggleVisibility,
  isVisible = true,
}: NavigatorItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const blockConfig = blockRegistry[block.type as keyof typeof blockRegistry];
  const blockName = blockConfig?.name || block.type;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get a display name from block props if available
  const getDisplayName = () => {
    if (block.props.title && typeof block.props.title === "string") {
      return block.props.title.slice(0, 30) + (block.props.title.length > 30 ? "..." : "");
    }
    if (block.props.heading && typeof block.props.heading === "string") {
      return block.props.heading.slice(0, 30) + (block.props.heading.length > 30 ? "..." : "");
    }
    return blockName;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted",
        isDragging && "opacity-50",
        !isVisible && "opacity-50"
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {block.type}
        </span>
        <span className="text-sm truncate">
          {getDisplayName()}
        </span>
      </div>

      {isHovered && (
        <div className="flex items-center gap-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicar</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {onToggleVisibility && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility();
                    }}
                  >
                    {isVisible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isVisible ? "Ocultar" : "Mostrar"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remover</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

interface NavigatorProps {
  className?: string;
}

export function Navigator({ className }: NavigatorProps) {
  const {
    blocks,
    selectedBlockId,
    selectBlock,
    removeBlock,
    moveBlock,
    duplicateBlock,
    toggleBlockVisibility,
    isBlockVisible,
  } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      moveBlock(oldIndex, newIndex);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Layers className="h-4 w-4" />
        <span className="font-medium text-sm">Navegador</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {blocks.length} {blocks.length === 1 ? "bloco" : "blocos"}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {blocks.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Nenhum bloco adicionado
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
              <div className="space-y-1">
                {blocks.map((block) => (
                  <NavigatorItem
                    key={block.id}
                    block={block}
                    isSelected={block.id === selectedBlockId}
                    isVisible={isBlockVisible(block.id)}
                    onSelect={() => selectBlock(block.id)}
                    onRemove={() => removeBlock(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onToggleVisibility={() => toggleBlockVisibility(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

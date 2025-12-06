"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Block } from "@/lib/store";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  isHidden?: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function SortableBlock({
  block,
  isSelected,
  isHidden = false,
  onSelect,
  onRemove,
}: SortableBlockProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isHidden && "opacity-30"
      )}
      onClick={onSelect}
    >
      {/* Block Controls */}
      <div
        className={cn(
          "absolute -left-10 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded bg-muted hover:bg-muted-foreground/20 cursor-grab"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Hidden Indicator */}
      {isHidden && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-muted rounded-md flex items-center gap-1 text-xs text-muted-foreground z-10">
          <EyeOff className="h-3 w-3" />
          Oculto
        </div>
      )}

      {/* Block Content */}
      <div className="pointer-events-none">
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}

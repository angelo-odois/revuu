"use client";

import { useState } from "react";
import {
  Layout,
  Type,
  Grid3X3,
  Image,
  Quote,
  Star,
  Video,
  MessageSquare,
  ChevronRight,
  CreditCard,
  Minus,
  Box,
  MousePointer,
  Layers,
  LayoutGrid,
  AlignLeft,
  Search,
  Sparkles,
  BarChart3,
  Gauge,
  ToggleLeft,
  ListOrdered,
  Timer,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { blockRegistry } from "@/components/blocks";

interface BlockPickerProps {
  onSelect: (type: string) => void;
  children: React.ReactNode;
}

// Icon mapping for each block type
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Layout,
  text: Type,
  "services-grid": Grid3X3,
  image: Image,
  quote: Quote,
  gallery: LayoutGrid,
  features: Star,
  "figma-embed": Box,
  testimonials: MessageSquare,
  accordion: ChevronRight,
  "video-embed": Video,
  cta: MousePointer,
  pricing: CreditCard,
  divider: Minus,
  section: Layers,
  counter: BarChart3,
  "progress-bar": Gauge,
  tabs: ListOrdered,
  toggle: ToggleLeft,
  countdown: Timer,
};

// Category names in Portuguese
const categoryNames: Record<string, string> = {
  header: "Cabecalho",
  content: "Conteudo",
  media: "Midia",
  layout: "Layout",
  interactive: "Interativo",
  advanced: "Avancado",
};

// Category icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  header: Layout,
  content: AlignLeft,
  media: Image,
  layout: LayoutGrid,
  interactive: MousePointer,
  advanced: Sparkles,
};

// Category order
const categoryOrder = ["header", "content", "media", "layout", "interactive", "advanced"];

export function BlockPicker({ onSelect, children }: BlockPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (type: string) => {
    onSelect(type);
    setOpen(false);
    setSearchQuery("");
  };

  // Group blocks by category
  const blocksByCategory = Object.entries(blockRegistry).reduce(
    (acc, [type, config]) => {
      const category = config.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push({ type, ...config });
      return acc;
    },
    {} as Record<string, Array<{ type: string; name: string; category: string }>>
  );

  // Filter blocks by search query
  const filteredBlocks = searchQuery
    ? Object.entries(blockRegistry)
        .filter(([type, config]) =>
          config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(([type, config]) => ({ type, ...config }))
    : null;

  // Get sorted categories
  const sortedCategories = categoryOrder.filter((cat) => blocksByCategory[cat]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSearchQuery("");
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Bloco</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar blocos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {/* Search results */}
          {filteredBlocks ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Resultados ({filteredBlocks.length})
              </h4>
              {filteredBlocks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum bloco encontrado
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredBlocks.map((block) => {
                    const Icon = iconMap[block.type] || Box;
                    return (
                      <Button
                        key={block.type}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                        onClick={() => handleSelect(block.type)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs font-medium">{block.name}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Categories View */
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start mb-4 flex-wrap h-auto gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Todos
                </TabsTrigger>
                {sortedCategories.map((category) => {
                  const CategoryIcon = categoryIcons[category] || Box;
                  return (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {categoryNames[category] || category}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* All blocks */}
              <TabsContent value="all" className="mt-0 space-y-6">
                {sortedCategories.map((category) => {
                  const blocks = blocksByCategory[category];
                  const CategoryIcon = categoryIcons[category] || Box;
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {categoryNames[category] || category}
                        </h4>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {blocks.map((block) => {
                          const Icon = iconMap[block.type] || Box;
                          return (
                            <Button
                              key={block.type}
                              variant="outline"
                              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                              onClick={() => handleSelect(block.type)}
                            >
                              <Icon className="h-6 w-6" />
                              <span className="text-xs font-medium">{block.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              {/* Category specific tabs */}
              {sortedCategories.map((category) => {
                const blocks = blocksByCategory[category];
                return (
                  <TabsContent key={category} value={category} className="mt-0">
                    <div className="grid grid-cols-3 gap-2">
                      {blocks.map((block) => {
                        const Icon = iconMap[block.type] || Box;
                        return (
                          <Button
                            key={block.type}
                            variant="outline"
                            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5"
                            onClick={() => handleSelect(block.type)}
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-xs font-medium">{block.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

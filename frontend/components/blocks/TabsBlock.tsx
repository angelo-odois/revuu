"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  title: string;
  content: string;
}

interface TabsBlockProps {
  tabs?: TabItem[];
  defaultTab?: number;
  tabStyle?: "default" | "pills" | "underline";
  alignment?: "left" | "center" | "right";
}

export function TabsBlock({
  tabs = [
    { title: "Tab 1", content: "Conteudo da primeira tab" },
    { title: "Tab 2", content: "Conteudo da segunda tab" },
    { title: "Tab 3", content: "Conteudo da terceira tab" },
  ],
  defaultTab = 0,
  tabStyle = "default",
  alignment = "left",
}: TabsBlockProps) {
  if (tabs.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Adicione tabs para exibir conteudo
      </div>
    );
  }

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const tabListClasses = {
    default: "bg-muted p-1 rounded-md",
    pills: "bg-transparent gap-2",
    underline: "bg-transparent border-b rounded-none",
  };

  const tabTriggerClasses = {
    default:
      "data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-sm",
    pills:
      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4",
    underline:
      "data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3",
  };

  return (
    <div className="py-6">
      <Tabs defaultValue={`tab-${defaultTab}`} className="w-full">
        <TabsList
          className={cn(
            "w-full",
            alignmentClasses[alignment],
            tabListClasses[tabStyle]
          )}
        >
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={index}
              value={`tab-${index}`}
              className={tabTriggerClasses[tabStyle]}
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab, index) => (
          <TabsContent
            key={index}
            value={`tab-${index}`}
            className="mt-4 p-4 bg-muted/30 rounded-lg"
          >
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: tab.content }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

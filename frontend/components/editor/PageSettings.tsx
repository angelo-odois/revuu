"use client";

import { useState } from "react";
import { Settings, Search, Globe, Code, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useEditorStore, PageSettings as PageSettingsType } from "@/lib/store";

interface PageSettingsProps {
  children: React.ReactNode;
}

export function PageSettings({ children }: PageSettingsProps) {
  const { pageSettings, updatePageSettings } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<PageSettingsType>(pageSettings);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalSettings(pageSettings);
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    updatePageSettings(localSettings);
    setOpen(false);
  };

  const updateLocal = (key: keyof PageSettingsType, value: string | boolean) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuracoes da Pagina
          </DialogTitle>
          <DialogDescription>
            Configure SEO, meta tags e outras opcoes da pagina.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="seo" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Avancado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo da Pagina</Label>
              <Input
                id="title"
                placeholder="Titulo para SEO"
                value={localSettings.title}
                onChange={(e) => updateLocal("title", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 50-60 caracteres ({localSettings.title.length}/60)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Meta Descricao</Label>
              <Textarea
                id="description"
                placeholder="Descricao para motores de busca"
                value={localSettings.description}
                onChange={(e) => updateLocal("description", e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 150-160 caracteres ({localSettings.description.length}/160)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/</span>
                <Input
                  id="slug"
                  placeholder="url-da-pagina"
                  value={localSettings.slug}
                  onChange={(e) => updateLocal("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">URL Canonica</Label>
              <Input
                id="canonicalUrl"
                placeholder="https://exemplo.com/pagina-original"
                value={localSettings.canonicalUrl}
                onChange={(e) => updateLocal("canonicalUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use se esta pagina for uma copia de outra
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Bloquear Indexacao</Label>
                <p className="text-xs text-muted-foreground">
                  Impede que motores de busca indexem esta pagina
                </p>
              </div>
              <Switch
                checked={localSettings.noIndex}
                onCheckedChange={(checked) => updateLocal("noIndex", checked)}
              />
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ogImage">Imagem Open Graph</Label>
              <div className="flex gap-2">
                <Input
                  id="ogImage"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={localSettings.ogImage}
                  onChange={(e) => updateLocal("ogImage", e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Imagem exibida ao compartilhar nas redes sociais (1200x630px recomendado)
              </p>
            </div>

            {localSettings.ogImage && (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Preview</p>
                <div className="aspect-[1200/630] bg-muted rounded-lg overflow-hidden">
                  <img
                    src={localSettings.ogImage}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon URL</Label>
              <Input
                id="favicon"
                placeholder="https://exemplo.com/favicon.ico"
                value={localSettings.favicon}
                onChange={(e) => updateLocal("favicon", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="customCss">CSS Customizado</Label>
              <Textarea
                id="customCss"
                placeholder=".minha-classe { color: red; }"
                value={localSettings.customCss}
                onChange={(e) => updateLocal("customCss", e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                CSS adicional aplicado apenas a esta pagina
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customJs">JavaScript Customizado</Label>
              <Textarea
                id="customJs"
                placeholder="console.log('Hello World');"
                value={localSettings.customJs}
                onChange={(e) => updateLocal("customJs", e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                JavaScript executado apos o carregamento da pagina
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Configuracoes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import {
  Layout,
  FileText,
  ShoppingCart,
  Briefcase,
  User,
  Home,
  Search,
  Check,
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
import { Block } from "@/lib/store";
import { cn } from "@/lib/utils";

interface TemplatesLibraryProps {
  onSelectTemplate: (blocks: Block[]) => void;
  children: React.ReactNode;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  blocks: Omit<Block, "id">[];
}

// Generate unique IDs for blocks
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Pre-defined templates
const templates: Template[] = [
  {
    id: "landing-hero",
    name: "Landing Page Hero",
    category: "landing",
    description: "Hero section com CTA para landing pages",
    blocks: [
      {
        type: "hero",
        props: {
          title: "Transforme suas ideias em realidade",
          subtitle: "A plataforma completa para criar, gerenciar e escalar seu negocio digital",
          badge: "Novo",
          backgroundColor: "gradient",
          alignment: "center",
          size: "large",
          titleColor: "default",
          titleSize: "xlarge",
          titleWeight: "bold",
          subtitleColor: "muted",
          badgeColor: "amber",
        },
      },
      {
        type: "features",
        props: {
          title: "Por que nos escolher?",
          subtitle: "Descubra os beneficios",
          features: [
            { title: "Rapido", description: "Resultados em minutos", icon: "zap" },
            { title: "Seguro", description: "Seus dados protegidos", icon: "shield" },
            { title: "Suporte", description: "Ajuda 24/7", icon: "headphones" },
          ],
          columns: 3,
        },
      },
      {
        type: "cta",
        props: {
          title: "Pronto para comecar?",
          subtitle: "Junte-se a milhares de usuarios satisfeitos",
          buttonText: "Comecar Agora",
          buttonUrl: "#",
          backgroundColor: "primary",
        },
      },
    ],
  },
  {
    id: "about-page",
    name: "Pagina Sobre",
    category: "about",
    description: "Layout completo para pagina institucional",
    blocks: [
      {
        type: "hero",
        props: {
          title: "Sobre Nos",
          subtitle: "Conheca nossa historia e nossa missao",
          backgroundColor: "muted",
          alignment: "center",
          size: "medium",
        },
      },
      {
        type: "text",
        props: {
          content: "<h2>Nossa Historia</h2><p>Fundada em 2020, nossa empresa nasceu com a missao de transformar a forma como as pessoas interagem com a tecnologia. Desde entao, temos trabalhado incansavelmente para criar solucoes inovadoras que facilitam a vida de nossos clientes.</p><p>Nossa equipe e formada por profissionais apaixonados por tecnologia e inovacao, sempre em busca de novas formas de agregar valor aos nossos produtos e servicos.</p>",
        },
      },
      {
        type: "features",
        props: {
          title: "Nossos Valores",
          features: [
            { title: "Inovacao", description: "Buscamos constantemente novas solucoes" },
            { title: "Qualidade", description: "Excelencia em tudo que fazemos" },
            { title: "Transparencia", description: "Comunicacao clara e honesta" },
            { title: "Colaboracao", description: "Trabalhamos juntos pelo sucesso" },
          ],
          columns: 4,
        },
      },
    ],
  },
  {
    id: "portfolio-showcase",
    name: "Portfolio Showcase",
    category: "portfolio",
    description: "Apresentacao de projetos e trabalhos",
    blocks: [
      {
        type: "hero",
        props: {
          title: "Meu Portfolio",
          subtitle: "Designer & Desenvolvedor Full-Stack",
          badge: "Disponivel para projetos",
          backgroundColor: "dark",
          alignment: "center",
          size: "large",
          titleColor: "white",
          subtitleColor: "white",
        },
      },
      {
        type: "gallery",
        props: {
          title: "Projetos Recentes",
          images: [],
          columns: 3,
        },
      },
      {
        type: "testimonials",
        props: {
          title: "O que dizem sobre mim",
          testimonials: [
            { name: "Cliente 1", role: "CEO", content: "Excelente trabalho!", avatar: "" },
            { name: "Cliente 2", role: "CTO", content: "Recomendo!", avatar: "" },
          ],
        },
      },
      {
        type: "cta",
        props: {
          title: "Vamos trabalhar juntos?",
          subtitle: "Entre em contato para discutir seu projeto",
          buttonText: "Entrar em Contato",
          buttonUrl: "#contact",
        },
      },
    ],
  },
  {
    id: "pricing-page",
    name: "Pagina de Precos",
    category: "pricing",
    description: "Tabela de precos com comparativo",
    blocks: [
      {
        type: "hero",
        props: {
          title: "Planos e Precos",
          subtitle: "Escolha o plano ideal para voce",
          backgroundColor: "gradient",
          alignment: "center",
          size: "small",
        },
      },
      {
        type: "pricing",
        props: {
          title: "Nossos Planos",
          plans: [
            {
              name: "Basico",
              price: "R$ 29",
              period: "/mes",
              features: ["1 Usuario", "5GB Storage", "Suporte Email"],
              buttonText: "Comecar",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "R$ 79",
              period: "/mes",
              features: ["5 Usuarios", "50GB Storage", "Suporte Prioritario", "API Access"],
              buttonText: "Comecar",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "R$ 199",
              period: "/mes",
              features: ["Usuarios Ilimitados", "Storage Ilimitado", "Suporte 24/7", "API Access", "Custom Integrations"],
              buttonText: "Contato",
              highlighted: false,
            },
          ],
        },
      },
      {
        type: "accordion",
        props: {
          title: "Perguntas Frequentes",
          items: [
            { title: "Posso cancelar a qualquer momento?", content: "Sim, voce pode cancelar sua assinatura a qualquer momento." },
            { title: "Existe periodo de teste?", content: "Sim, oferecemos 14 dias de teste gratuito em todos os planos." },
            { title: "Quais formas de pagamento?", content: "Aceitamos cartao de credito, boleto e PIX." },
          ],
        },
      },
    ],
  },
  {
    id: "blog-post",
    name: "Post de Blog",
    category: "blog",
    description: "Layout para artigos e posts",
    blocks: [
      {
        type: "hero",
        props: {
          title: "Titulo do Artigo",
          subtitle: "Por Nome do Autor | 10 de Janeiro, 2024",
          backgroundColor: "none",
          alignment: "center",
          size: "small",
        },
      },
      {
        type: "image",
        props: {
          src: "",
          alt: "Imagem de capa",
          caption: "Legenda da imagem",
        },
      },
      {
        type: "text",
        props: {
          content: "<p>Introducao do artigo com um resumo do que sera abordado...</p><h2>Primeiro Topico</h2><p>Conteudo detalhado sobre o primeiro topico...</p><h2>Segundo Topico</h2><p>Conteudo detalhado sobre o segundo topico...</p><h2>Conclusao</h2><p>Resumo final e consideracoes...</p>",
        },
      },
      {
        type: "divider",
        props: {
          style: "solid",
        },
      },
      {
        type: "cta",
        props: {
          title: "Gostou do conteudo?",
          subtitle: "Inscreva-se na nossa newsletter",
          buttonText: "Inscrever-se",
          buttonUrl: "#newsletter",
          backgroundColor: "muted",
        },
      },
    ],
  },
  {
    id: "contact-page",
    name: "Pagina de Contato",
    category: "contact",
    description: "Formulario e informacoes de contato",
    blocks: [
      {
        type: "hero",
        props: {
          title: "Entre em Contato",
          subtitle: "Estamos aqui para ajudar",
          backgroundColor: "primary",
          alignment: "center",
          size: "small",
          titleColor: "white",
          subtitleColor: "white",
        },
      },
      {
        type: "features",
        props: {
          title: "Formas de Contato",
          features: [
            { title: "Email", description: "contato@empresa.com", icon: "mail" },
            { title: "Telefone", description: "(11) 99999-9999", icon: "phone" },
            { title: "Endereco", description: "Sao Paulo, SP", icon: "map-pin" },
          ],
          columns: 3,
        },
      },
      {
        type: "text",
        props: {
          content: "<h2>Horario de Atendimento</h2><p>Segunda a Sexta: 9h as 18h<br/>Sabado: 9h as 13h</p>",
        },
      },
    ],
  },
];

// Category configuration
const categories = [
  { id: "all", name: "Todos", icon: Layout },
  { id: "landing", name: "Landing Page", icon: Home },
  { id: "about", name: "Sobre", icon: User },
  { id: "portfolio", name: "Portfolio", icon: Briefcase },
  { id: "pricing", name: "Precos", icon: ShoppingCart },
  { id: "blog", name: "Blog", icon: FileText },
  { id: "contact", name: "Contato", icon: User },
];

export function TemplatesLibrary({ onSelectTemplate, children }: TemplatesLibraryProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectTemplate = () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    // Convert template blocks to actual blocks with IDs
    const blocks: Block[] = template.blocks.map((block) => ({
      id: generateId(),
      type: block.type,
      props: { ...block.props },
    }));

    onSelectTemplate(blocks);
    setOpen(false);
    setSearchQuery("");
    setSelectedTemplate(null);
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearchQuery("");
          setSelectedTemplate(null);
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Biblioteca de Templates</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-4 h-[500px]">
          {/* Categories sidebar */}
          <div className="w-48 shrink-0">
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Templates grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 gap-4 pr-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "relative border rounded-lg p-4 cursor-pointer transition-all hover:border-primary",
                    selectedTemplate === template.id && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  {/* Template Preview */}
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                    <div className="text-center">
                      <Layout className="h-8 w-8 mx-auto text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {template.blocks.length} blocos
                      </span>
                    </div>
                  </div>

                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  Nenhum template encontrado
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSelectTemplate} disabled={!selectedTemplate}>
            Usar Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

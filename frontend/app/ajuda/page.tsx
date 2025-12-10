import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Search,
  BookOpen,
  Settings,
  Palette,
  Globe,
  CreditCard,
  MessageCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Central de Ajuda - Revuu",
  description: "Encontre respostas para suas dúvidas sobre o Revuu. Tutoriais, guias e suporte para criar seu portfólio profissional.",
};

const categories = [
  {
    icon: BookOpen,
    title: "Primeiros Passos",
    description: "Aprenda a criar sua conta e seu primeiro portfólio",
    articles: [
      "Como criar uma conta",
      "Escolhendo o template ideal",
      "Personalizando seu portfólio",
      "Publicando seu portfólio",
    ],
  },
  {
    icon: Palette,
    title: "Editor Visual",
    description: "Domine o editor drag-and-drop do Revuu",
    articles: [
      "Visão geral do editor",
      "Adicionando blocos",
      "Personalizando cores e fontes",
      "Salvando e versionando",
    ],
  },
  {
    icon: Globe,
    title: "Domínio e URL",
    description: "Configure seu domínio personalizado",
    articles: [
      "Usando subdomínio gratuito",
      "Configurando domínio próprio",
      "Apontando DNS",
      "Certificado SSL",
    ],
  },
  {
    icon: Settings,
    title: "Configurações",
    description: "Gerencie sua conta e preferências",
    articles: [
      "Alterando dados da conta",
      "Configurações de SEO",
      "Integrações disponíveis",
      "Excluindo conta",
    ],
  },
  {
    icon: CreditCard,
    title: "Planos e Pagamentos",
    description: "Informações sobre assinatura e cobrança",
    articles: [
      "Comparativo de planos",
      "Como fazer upgrade",
      "Formas de pagamento",
      "Cancelamento e reembolso",
    ],
  },
  {
    icon: MessageCircle,
    title: "Suporte",
    description: "Entre em contato com nossa equipe",
    articles: [
      "Canais de atendimento",
      "Horário de suporte",
      "Reportar um bug",
      "Solicitar recurso",
    ],
  },
];

const popularArticles = [
  "Como adicionar projetos ao meu portfólio?",
  "Posso usar meu próprio domínio gratuitamente?",
  "Como exportar meu portfólio para PDF?",
  "O Revuu funciona no celular?",
  "Como integrar Google Analytics?",
];

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/revuuLogo.png"
              alt="Revuu"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/admin"
            className="text-sm px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
          >
            Acessar Conta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Como podemos ajudar?
          </h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar artigos, tutoriais..."
              className="w-full h-14 pl-12 pr-4 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Categorias</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.title}
                className="p-6 bg-card border border-border/50 rounded-xl hover:border-amber-500/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <category.icon className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-amber-500 flex items-center gap-2"
                      >
                        <ChevronRight className="h-3 w-3" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Artigos Populares</h2>
          <div className="space-y-3">
            {popularArticles.map((article) => (
              <Link
                key={article}
                href="#"
                className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-lg hover:border-amber-500/50 transition-colors group"
              >
                <span>{article}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ainda precisa de ajuda?</h2>
          <p className="text-muted-foreground mb-8">
            Nossa equipe está pronta para ajudar você.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors"
          >
            Entrar em Contato
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Revuu. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/termos" className="hover:text-foreground">Termos</Link>
            <Link href="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <Link href="/contato" className="hover:text-foreground">Contato</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

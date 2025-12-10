"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "suporte@revuu.com.br",
    description: "Resposta em até 24h",
  },
  {
    icon: MessageSquare,
    title: "Chat",
    value: "Chat ao vivo",
    description: "Disponível em horário comercial",
  },
  {
    icon: Clock,
    title: "Horário",
    value: "Seg-Sex, 9h-18h",
    description: "Horário de Brasília",
  },
  {
    icon: MapPin,
    title: "Localização",
    value: "São Paulo, Brasil",
    description: "Atendimento remoto",
  },
];

const subjects = [
  "Dúvida sobre planos",
  "Suporte técnico",
  "Problema com pagamento",
  "Solicitar recurso",
  "Parceria",
  "Outro",
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSending(false);
    setSent(true);
  };

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-muted-foreground">
            Estamos aqui para ajudar. Escolha a melhor forma de nos contatar.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="p-6 bg-card border border-border/50 rounded-xl text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <info.icon className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-1">{info.title}</h3>
                <p className="text-amber-500 font-medium mb-1">{info.value}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Envie uma mensagem</h2>

            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Mensagem enviada!</h3>
                <p className="text-muted-foreground mb-6">
                  Recebemos sua mensagem e responderemos em breve.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    setFormState({ name: "", email: "", subject: "", message: "" });
                  }}
                >
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <select
                    id="subject"
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState({ ...formState, subject: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="">Selecione um assunto</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    placeholder="Descreva sua dúvida ou solicitação..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-12 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-2">Precisa de ajuda rápida?</h2>
          <p className="text-muted-foreground mb-4">
            Confira nossa Central de Ajuda com respostas para as dúvidas mais
            comuns.
          </p>
          <Link
            href="/ajuda"
            className="text-amber-500 font-medium hover:underline"
          >
            Acessar Central de Ajuda →
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
            <Link href="/ajuda" className="hover:text-foreground">Ajuda</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

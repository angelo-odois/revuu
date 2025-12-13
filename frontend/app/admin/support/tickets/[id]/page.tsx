"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Headphones,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLayout, DashboardSkeleton } from "@/components/admin";
import { useAuthStore } from "@/lib/store";
import { api, Ticket, TicketStatus, TicketPriority, TicketCategory, TicketMessage } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusLabels: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  waiting_response: "Aguardando Resposta",
  resolved: "Resolvido",
  closed: "Fechado",
};

const statusColors: Record<TicketStatus, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  waiting_response: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const priorityLabels: Record<TicketPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const priorityColors: Record<TicketPriority, string> = {
  low: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  medium: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20",
};

const categoryLabels: Record<TicketCategory, string> = {
  technical: "Técnico",
  billing: "Cobrança",
  account: "Conta",
  feature_request: "Sugestão",
  bug_report: "Bug",
  other: "Outro",
};

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/admin");
      return;
    }
    loadTicket();
  }, [user, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadTicket = async () => {
    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();

    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      const response = await api.getTicket(ticketId, token);
      setTicket(response);
    } catch (error) {
      console.error("Failed to load ticket:", error);
      toast({
        title: "Erro ao carregar ticket",
        variant: "destructive",
      });
      router.push("/admin/support/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();
    if (!token) return;

    setSending(true);
    try {
      await api.addTicketMessage(ticketId, message.trim(), token);
      setMessage("");
      loadTicket();

      toast({
        title: "Mensagem enviada!",
        variant: "success",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao enviar mensagem",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();
    if (!token) return;

    setClosing(true);
    try {
      await api.closeTicket(ticketId, token);
      loadTicket();

      toast({
        title: "Ticket fechado!",
        description: "O ticket foi fechado com sucesso.",
        variant: "success",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao fechar ticket",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setClosing(false);
    }
  };

  const handleAssignToMe = async () => {
    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();
    if (!token) return;

    setAssigning(true);
    try {
      await api.assignTicketToMe(ticketId, token);
      loadTicket();

      toast({
        title: "Ticket atribuido!",
        description: "O ticket foi atribuido para voce.",
        variant: "success",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao atribuir ticket",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();
    if (!token) return;

    setUpdatingStatus(true);
    try {
      await api.updateAdminTicket(ticketId, { status: newStatus }, token);
      loadTicket();

      toast({
        title: "Status atualizado!",
        description: `Status alterado para "${statusLabels[newStatus]}"`,
        variant: "success",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao atualizar status",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getMessageIcon = (msg: TicketMessage) => {
    if (msg.type === "system") {
      return <Bot className="h-4 w-4" />;
    }
    if (msg.type === "support") {
      return <Headphones className="h-4 w-4" />;
    }
    return <User className="h-4 w-4" />;
  };

  const isTicketClosed = ticket?.status === "closed" || ticket?.status === "resolved";
  const isStaff = user?.role === "admin" || user?.role === "support";
  const isOwnTicket = ticket?.user?.id === user?.id;

  if (loading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium">Ticket não encontrado</h2>
          <Link href="/admin/support/tickets">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Tickets
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/support/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {statusLabels[ticket.status]}
            </Badge>
            <Badge variant="outline" className={priorityColors[ticket.priority]}>
              {priorityLabels[ticket.priority]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {categoryLabels[ticket.category]}
            </span>
          </div>
        </div>

        {!isTicketClosed && (
          <Button variant="outline" onClick={handleCloseTicket} disabled={closing}>
            {closing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Fechar Ticket
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversa</CardTitle>
              <CardDescription>Historico de mensagens do ticket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {ticket.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.type === "user" ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                        msg.type === "user"
                          ? "bg-primary/10 text-primary"
                          : msg.type === "support"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {getMessageIcon(msg)}
                    </div>
                    <div
                      className={cn(
                        "flex-1 rounded-lg p-3",
                        msg.type === "user"
                          ? "bg-primary/10"
                          : msg.type === "support"
                          ? "bg-green-500/10"
                          : "bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {msg.type === "user"
                            ? msg.user?.name || "Voce"
                            : msg.type === "support"
                            ? msg.user?.name || "Suporte"
                            : "Sistema"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              {!isTicketClosed ? (
                <div className="mt-6 pt-4 border-t">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="mb-3"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Ctrl + Enter para enviar
                    </span>
                    <Button onClick={handleSendMessage} disabled={sending || !message.trim()}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t text-center text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Este ticket foi {ticket.status === "closed" ? "fechado" : "resolvido"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">ID do Ticket</label>
                <p className="text-sm font-mono">{ticket.id}</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Criado em</label>
                <p className="text-sm">
                  {format(new Date(ticket.createdAt), "dd 'de' MMMM 'de' yyyy 'as' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Ultima atualizacao</label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(ticket.updatedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>

              {ticket.assignedTo && (
                <div>
                  <label className="text-xs text-muted-foreground">Atribuido a</label>
                  <p className="text-sm">{ticket.assignedTo.name}</p>
                </div>
              )}

              {ticket.firstResponseAt && (
                <div>
                  <label className="text-xs text-muted-foreground">Primeira resposta</label>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(ticket.firstResponseAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}

              {ticket.resolvedAt && (
                <div>
                  <label className="text-xs text-muted-foreground">Resolvido em</label>
                  <p className="text-sm">
                    {format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}

              {ticket.closedAt && (
                <div>
                  <label className="text-xs text-muted-foreground">Fechado em</label>
                  <p className="text-sm">
                    {format(new Date(ticket.closedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SLA Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SLA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">Prazo</label>
                  <p className="text-sm">
                    {format(new Date(ticket.slaDeadline), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Status SLA</label>
                  {ticket.slaBreach ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">SLA violado</span>
                    </div>
                  ) : isTicketClosed ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Dentro do SLA</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(ticket.slaDeadline), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Management - Only for admin/support */}
          {isStaff && !isTicketClosed && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Gerenciamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assign to me */}
                {!ticket.assignedTo && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Atribuicao
                    </label>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleAssignToMe}
                      disabled={assigning}
                    >
                      {assigning ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <User className="h-4 w-4 mr-2" />
                      )}
                      Atribuir para mim
                    </Button>
                  </div>
                )}

                {ticket.assignedTo && ticket.assignedTo.id === user?.id && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Atribuicao
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Atribuido a voce</span>
                    </div>
                  </div>
                )}

                {ticket.assignedTo && ticket.assignedTo.id !== user?.id && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Atribuicao
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{ticket.assignedTo.name}</span>
                    </div>
                  </div>
                )}

                {/* Change status */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Alterar Status
                  </label>
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => handleUpdateStatus(value as TicketStatus)}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="waiting_response">Aguardando Resposta</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User view - ticket owner info when not staff */}
          {!isStaff && isOwnTicket && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seu Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o progresso do seu ticket. Voce sera notificado quando houver atualizacoes.
                </p>
                {ticket.assignedTo && (
                  <div className="mt-4 flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
                    <Headphones className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Atendido por: {ticket.assignedTo.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

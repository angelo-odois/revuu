"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Ticket as TicketIcon,
  Search,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ArrowLeft,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminLayout, DashboardSkeleton } from "@/components/admin";
import { useAuthStore } from "@/lib/store";
import { api, Ticket, TicketStatus, TicketPriority, TicketCategory } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  medium: "Media",
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
  technical: "Tecnico",
  billing: "Cobranca",
  account: "Conta",
  feature_request: "Sugestao",
  bug_report: "Bug",
  other: "Outro",
};

export default function TicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Check if user is staff (admin or support)
  const isStaff = user?.role === "admin" || user?.role === "support";

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignedToMeFilter, setAssignedToMeFilter] = useState(false);

  // Create dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [category, setCategory] = useState<TicketCategory>("other");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/admin");
      return;
    }
    loadData();
  }, [user, pagination.page, statusFilter, assignedToMeFilter]);

  // Handle query parameters for pre-filling the create dialog
  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true") {
      const subjectParam = searchParams.get("subject");
      const descriptionParam = searchParams.get("description");
      const categoryParam = searchParams.get("category");
      const priorityParam = searchParams.get("priority");

      if (subjectParam) setSubject(decodeURIComponent(subjectParam));
      if (descriptionParam) setDescription(decodeURIComponent(descriptionParam));
      if (categoryParam && Object.keys(categoryLabels).includes(categoryParam)) {
        setCategory(categoryParam as TicketCategory);
      }
      if (priorityParam && Object.keys(priorityLabels).includes(priorityParam)) {
        setPriority(priorityParam as TicketPriority);
      }

      setIsDialogOpen(true);

      // Clean up URL params
      router.replace("/admin/support/tickets", { scroll: false });
    }
  }, [searchParams, router]);

  const loadData = async () => {
    const { getValidToken, user: currentUser } = useAuthStore.getState();
    const token = await getValidToken();

    if (!token) {
      router.push("/admin");
      return;
    }

    const userIsStaff = currentUser?.role === "admin" || currentUser?.role === "support";

    try {
      let response;

      if (userIsStaff) {
        // Staff sees all tickets
        const params: {
          status?: TicketStatus;
          page?: number;
          limit?: number;
          assignedToMe?: boolean;
        } = {
          page: pagination.page,
          limit: pagination.limit,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter as TicketStatus;
        }
        if (assignedToMeFilter) {
          params.assignedToMe = true;
        }

        response = await api.getAdminTickets(token, params);
      } else {
        // Regular users see only their own tickets
        const params: { status?: TicketStatus; page?: number; limit?: number } = {
          page: pagination.page,
          limit: pagination.limit,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter as TicketStatus;
        }

        response = await api.getMyTickets(token, params);
      }

      setTickets(response.tickets);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      toast({
        title: "Erro ao carregar tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Preencha o assunto e a descricao do ticket",
        variant: "destructive",
      });
      return;
    }

    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();
    if (!token) return;

    setCreating(true);
    try {
      await api.createTicket(
        {
          subject: subject.trim(),
          description: description.trim(),
          priority,
          category,
        },
        token
      );

      toast({
        title: "Ticket criado!",
        description: "Seu ticket foi criado com sucesso. Entraremos em contato em breve.",
        variant: "success",
      });

      setIsDialogOpen(false);
      setSubject("");
      setDescription("");
      setPriority("medium");
      setCategory("other");
      loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao criar ticket",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting_response"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  if (loading) {
    return (
      <AdminLayout title="Tickets de Suporte">
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isStaff ? "Gerenciar Tickets" : "Tickets de Suporte"}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/support">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TicketIcon className="h-6 w-6 text-primary" />
            {isStaff ? "Gerenciar Tickets" : "Meus Tickets"}
          </h1>
          <p className="text-muted-foreground">
            {isStaff
              ? "Visualize e gerencie todos os tickets de suporte"
              : "Acompanhe e gerencie seus tickets de suporte"}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{pagination.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{openCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{resolvedCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isStaff && (
              <Button
                variant={assignedToMeFilter ? "default" : "outline"}
                onClick={() => setAssignedToMeFilter(!assignedToMeFilter)}
              >
                <User className="h-4 w-4 mr-2" />
                Meus Atendimentos
              </Button>
            )}

            <div className="flex-1" />

            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Clique em um ticket para ver detalhes e responder</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TicketIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Nenhum ticket encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter === "all"
                  ? "Voce ainda nao abriu nenhum ticket de suporte"
                  : "Nenhum ticket corresponde ao filtro selecionado"}
              </p>
              {statusFilter === "all" && (
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Ticket
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Assunto
                      </th>
                      {isStaff && (
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                          Usuario
                        </th>
                      )}
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Categoria
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Prioridade
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Criado
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-muted/30 cursor-pointer"
                        onClick={() => router.push(`/admin/support/tickets/${ticket.id}`)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {ticket.slaBreach && (
                              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            <span className="font-medium">{ticket.subject}</span>
                          </div>
                        </td>
                        {isStaff && (
                          <td className="p-3 text-sm text-muted-foreground">
                            {ticket.user?.name || "Usuario"}
                          </td>
                        )}
                        <td className="p-3 text-sm text-muted-foreground">
                          {categoryLabels[ticket.category]}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {priorityLabels[ticket.priority]}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {statusLabels[ticket.status]}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/support/tickets/${ticket.id}`);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                    {pagination.total} tickets
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Pagina {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Ticket</DialogTitle>
            <DialogDescription>
              Descreva seu problema ou duvida e nossa equipe respondera o mais breve possivel.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Assunto *</Label>
              <Input
                id="subject"
                placeholder="Resumo do seu problema"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descricao *</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente seu problema ou duvida..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTicket} disabled={creating}>
              {creating ? "Criando..." : "Criar Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

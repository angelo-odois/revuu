"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  RefreshCw,
  Crown,
  Shield,
  UserPlus,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { api, AdminUser, AdminUsersStats } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function UsersAdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUsersStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Edit dialog
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editPlan, setEditPlan] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/admin");
      return;
    }

    // Only admins can access this page
    if (user.role !== "admin") {
      router.push("/admin/dashboard");
      return;
    }

    loadData();
  }, [user, pagination.page, search, planFilter, roleFilter]);

  const loadData = async () => {
    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();

    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      const [usersResponse, statsResponse] = await Promise.all([
        api.getAdminUsers(token, {
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          plan: planFilter !== "all" ? planFilter : undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
        }),
        api.getAdminUsersStats(token),
      ]);

      setUsers(usersResponse.users);
      setPagination(usersResponse.pagination);
      setStats(statsResponse);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast({
        title: "Erro ao carregar usuarios",
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

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEditUser = (userToEdit: AdminUser) => {
    setEditingUser(userToEdit);
    setEditPlan(userToEdit.plan);
    setEditRole(userToEdit.role);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();
    if (!token) return;

    setSaving(true);
    try {
      await api.updateAdminUser(
        editingUser.id,
        {
          plan: editPlan,
          role: editRole,
        },
        token
      );

      toast({
        title: "Usuario atualizado!",
        variant: "success",
      });

      setEditingUser(null);
      loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao atualizar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    const { getValidToken } = useAuthStore.getState();
    const token = await getValidToken();
    if (!token) return;

    setDeleting(true);
    try {
      await api.deleteAdminUser(deletingUser.id, token);

      toast({
        title: "Usuario excluido!",
        variant: "success",
      });

      setDeletingUser(null);
      loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao excluir usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "business":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Crown className="h-3 w-3 mr-1" />
            Business
          </Badge>
        );
      case "pro":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
            <Crown className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Free
          </Badge>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Editor
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Usuarios">
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gerenciamento de Usuarios">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats?.totalUsers || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats?.newUsersThisMonth || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plano Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-indigo-500" />
              <span className="text-2xl font-bold">{stats?.byPlan?.pro || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plano Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats?.byPlan?.business || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou username..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Planos</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <Shield className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Usuario
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Plano
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Criado em
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-semibold shrink-0">
                          {u.name?.charAt(0) || u.email?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          {u.username && (
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{getPlanBadge(u.plan)}</td>
                    <td className="p-3">{getRoleBadge(u.role)}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditUser(u)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Plano/Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingUser(u)}
                            className="text-destructive"
                            disabled={u.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum usuario encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                {pagination.total} usuarios
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
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Altere o plano ou role do usuario {editingUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plano</label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuario</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuario {deletingUser?.name}? Esta acao nao pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

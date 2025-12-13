"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
  Crown,
  Lock,
  Globe,
  Shield,
  User,
  Link2,
  ExternalLink,
  Copy,
  Plus,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { useAuthStore } from "@/lib/store";
import { api, type CustomDomain } from "@/lib/api";
import { AdminLayout, SettingsPageSkeleton } from "@/components/admin";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/hooks/use-toast";
import { LanguageSelectorInline } from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user, getValidToken, updateUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [showRevuuBranding, setShowRevuuBranding] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Domain states
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [showDomainDialog, setShowDomainDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await getValidToken();
      if (!token) {
        setLoading(false);
        return;
      }

      if (user?.username) {
        setUsername(user.username);
      }
      if (user?.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
      }

      // Load custom domains from API (only for Pro/Business users)
      if (user?.plan === "pro" || user?.plan === "business") {
        try {
          const domains = await api.getDomains(token);
          setCustomDomains(domains);
        } catch (error) {
          console.error("Failed to load domains:", error);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (value === user?.username) {
      setUsernameAvailable(null);
      return;
    }

    const token = await getValidToken();
    if (!token) return;

    setCheckingUsername(true);
    try {
      const result = await api.checkUsername(value, token);
      setUsernameAvailable(result.available);
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const saveUsername = async () => {
    const token = await getValidToken();
    if (!token || !usernameAvailable) return;

    setSaving(true);
    try {
      await api.updateUsername(username, token);
      updateUser({ username });
      setUsernameAvailable(null);
      toast({ title: "Username atualizado!", variant: "success" });
    } catch (error) {
      console.error("Failed to save username:", error);
      toast({ title: "Erro ao salvar username", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveAvatar = async () => {
    const token = await getValidToken();
    if (!token) return;

    setSavingAvatar(true);
    try {
      await api.updateAvatar(avatarUrl, token);
      updateUser({ avatarUrl });
      toast({ title: "Avatar atualizado!", variant: "success" });
    } catch (error) {
      console.error("Failed to save avatar:", error);
      toast({ title: "Erro ao salvar avatar", variant: "destructive" });
    } finally {
      setSavingAvatar(false);
    }
  };

  const saveBranding = async () => {
    const token = await getValidToken();
    if (!token) return;

    setSavingBranding(true);
    try {
      // TODO: Implement API call to save branding preference
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({ title: "Preferência de branding salva!", variant: "success" });
    } catch (error) {
      console.error("Failed to save branding:", error);
      toast({ title: "Erro ao salvar preferência", variant: "destructive" });
    } finally {
      setSavingBranding(false);
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "As senhas não conferem", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "A nova senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    const token = await getValidToken();
    if (!token) return;

    setSavingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword, token);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Senha alterada com sucesso!", variant: "success" });
    } catch (error: unknown) {
      console.error("Failed to change password:", error);
      const err = error as { message?: string };
      toast({ title: err.message || "Erro ao alterar senha", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    const token = await getValidToken();
    if (!token) return;

    setAddingDomain(true);
    try {
      const domain = await api.addDomain(newDomain, token);
      setCustomDomains([...customDomains, domain]);
      setNewDomain("");
      setShowDomainDialog(false);
      toast({ title: "Domínio adicionado! Configure o DNS.", variant: "success" });
    } catch (error) {
      console.error("Failed to add domain:", error);
      toast({ title: "Erro ao adicionar domínio", variant: "destructive" });
    } finally {
      setAddingDomain(false);
    }
  };

  const handleRemoveDomain = async (domainId: string) => {
    const token = await getValidToken();
    if (!token) return;

    try {
      await api.deleteDomain(domainId, token);
      setCustomDomains(customDomains.filter(d => d.id !== domainId));
      toast({ title: "Domínio removido", variant: "success" });
    } catch (error) {
      console.error("Failed to remove domain:", error);
      toast({ title: "Erro ao remover domínio", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", variant: "success" });
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ title: "Digite sua senha para confirmar", variant: "destructive" });
      return;
    }

    const token = await getValidToken();
    if (!token) return;

    setDeletingAccount(true);
    try {
      await api.deleteAccount(deletePassword, token);
      logout();
      router.push("/admin");
    } catch (error: unknown) {
      console.error("Failed to delete account:", error);
      const err = error as { message?: string };
      toast({ title: err.message || "Erro ao excluir conta", variant: "destructive" });
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SettingsPageSkeleton />
      </AdminLayout>
    );
  }

  const publicUrl = `https://revuu.com.br/u/${user?.username || ""}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie sua conta e preferências
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="general" className="gap-2">
              <User className="h-4 w-4 hidden sm:inline" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:inline" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="domain" className="gap-2">
              <Globe className="h-4 w-4 hidden sm:inline" />
              Domínio
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <AlertTriangle className="h-4 w-4 hidden sm:inline" />
              Avançado
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perfil</CardTitle>
                <CardDescription>
                  Suas informações públicas e de identificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <ImageUpload
                      value={avatarUrl}
                      onChange={(url) => setAvatarUrl(url || "")}
                      aspectRatio="square"
                      placeholder="Arraste ou clique"
                      className="w-24 h-24"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={user?.name || ""}
                        disabled
                        className="bg-muted mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Edite seu nome na página de Perfil
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={saveAvatar}
                      disabled={savingAvatar || avatarUrl === user?.avatarUrl}
                    >
                      {savingAvatar ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar Foto
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Username/URL */}
                <div className="space-y-4">
                  <div>
                    <Label>Sua URL Pública</Label>
                    <p className="text-sm text-muted-foreground">
                      Este é o link do seu portfólio que você pode compartilhar
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                          revuu.com.br/u/
                        </span>
                        <div className="relative flex-1">
                          <Input
                            value={username}
                            onChange={(e) => {
                              const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                              setUsername(value);
                              checkUsernameAvailability(value);
                            }}
                            placeholder="seu-username"
                            className="rounded-l-none pr-10"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {checkingUsername && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {!checkingUsername && usernameAvailable === true && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            {!checkingUsername && usernameAvailable === false && (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      {usernameAvailable === false && (
                        <p className="text-xs text-red-500 mt-1">Este username já está em uso</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(publicUrl)}
                        title="Copiar URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Abrir em nova aba"
                      >
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        onClick={saveUsername}
                        disabled={!usernameAvailable || saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferências</CardTitle>
                <CardDescription>
                  Personalize sua experiência no Revuu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Idioma da Interface</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha o idioma de exibição do painel
                    </p>
                  </div>
                  <LanguageSelectorInline />
                </div>

                <Separator />

                {/* Branding Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Label>Exibir marca Revuu</Label>
                      {user?.plan !== "business" && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                          <Crown className="h-3 w-3 mr-1" />
                          Business
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mostrar "Powered by Revuu" no rodapé do seu portfólio
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {user?.plan === "business" ? (
                      <>
                        <Switch
                          checked={showRevuuBranding}
                          onCheckedChange={(checked) => {
                            setShowRevuuBranding(checked);
                            saveBranding();
                          }}
                          disabled={savingBranding}
                        />
                        {savingBranding && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </>
                    ) : (
                      <Link href="/admin/subscription">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conta</CardTitle>
                <CardDescription>
                  Informações da sua conta de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">E-mail</Label>
                    <p className="font-medium">{user?.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Plano</Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          user?.plan === "business" && "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950",
                          user?.plan === "pro" && "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950",
                          (!user?.plan || user?.plan === "free") && "border-gray-400 text-gray-500"
                        )}
                      >
                        {user?.plan === "business" ? "Business" : user?.plan === "pro" ? "Pro" : "Grátis"}
                      </Badge>
                      {(!user?.plan || user?.plan === "free") && (
                        <Link href="/admin/subscription">
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            Fazer upgrade
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso ao painel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Senha Atual</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite sua senha atual"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>Nova Senha</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>Confirmar Nova Senha</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={savePassword}
                  disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>

            {/* Sessions - Future feature */}
            <Card className="border-dashed">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">Sessões Ativas</CardTitle>
                  <Badge variant="secondary">Em breve</Badge>
                </div>
                <CardDescription>
                  Gerencie os dispositivos conectados à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Esta funcionalidade estará disponível em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domain Tab */}
          <TabsContent value="domain" className="space-y-6">
            {/* Default URL */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">URL Padrão</CardTitle>
                <CardDescription>
                  Seu portfólio está disponível neste endereço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Link2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <code className="flex-1 text-sm font-mono truncate">
                    {publicUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(publicUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Domain */}
            <Card className={user?.plan === "free" ? "border-dashed" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Domínio Personalizado</CardTitle>
                      {user?.plan !== "business" && user?.plan !== "pro" && (
                        <Badge variant="outline" className="text-xs border-indigo-500 text-indigo-600">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Use seu próprio domínio para o portfólio
                    </CardDescription>
                  </div>
                  {(user?.plan === "pro" || user?.plan === "business") && (
                    <Button onClick={() => setShowDomainDialog(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {user?.plan !== "pro" && user?.plan !== "business" ? (
                  <div className="text-center py-6">
                    <Globe className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Use um domínio personalizado como<br />
                      <code className="text-sm bg-muted px-2 py-1 rounded">portfolio.seusite.com</code>
                    </p>
                    <Link href="/admin/subscription">
                      <Button className="gap-2">
                        <Crown className="h-4 w-4" />
                        Upgrade para Pro
                      </Button>
                    </Link>
                  </div>
                ) : customDomains.length === 0 ? (
                  <div className="text-center py-6">
                    <Globe className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum domínio personalizado configurado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customDomains.map((domain) => (
                      <div
                        key={domain.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            domain.status === "active" && "bg-green-500",
                            domain.status === "pending" && "bg-yellow-500",
                            domain.status === "error" && "bg-red-500"
                          )} />
                          <div>
                            <p className="font-medium font-mono text-sm">{domain.domain}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              {domain.status === "active" && (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  Ativo
                                </>
                              )}
                              {domain.status === "pending" && (
                                <>
                                  <Clock className="h-3 w-3 text-yellow-500" />
                                  Aguardando DNS
                                </>
                              )}
                              {domain.status === "error" && (
                                <>
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  Erro na configuração
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDomain(domain.id)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DNS Instructions */}
            {(user?.plan === "pro" || user?.plan === "business") && customDomains.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuração de DNS:</strong> Adicione um registro CNAME apontando seu domínio para{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">cname.revuu.com.br</code>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg text-red-600 dark:text-red-400">
                    Zona de Perigo
                  </CardTitle>
                </div>
                <CardDescription>
                  Ações irreversíveis. Prossiga com cautela.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showDeleteConfirm ? (
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        Excluir conta permanentemente
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Todos os dados serão removidos e não poderão ser recuperados
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          Confirmar exclusão
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente excluídos:
                        </p>
                        <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                          <li>Perfil e informações pessoais</li>
                          <li>Experiências e formação</li>
                          <li>Projetos e páginas do portfólio</li>
                          <li>Configurações e domínios personalizados</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <Label>Digite sua senha para confirmar</Label>
                      <Input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Sua senha"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount || !deletePassword}
                      >
                        {deletingAccount ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Excluir Permanentemente
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Domain Dialog */}
      <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Domínio Personalizado</DialogTitle>
            <DialogDescription>
              Digite o domínio que deseja usar para seu portfólio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Domínio</Label>
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                placeholder="portfolio.seusite.com"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use um subdomínio como <code>portfolio.seusite.com</code> ou um domínio próprio
              </p>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Após adicionar, você precisará configurar um registro CNAME no DNS do seu domínio apontando para <code>cname.revuu.com.br</code>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDomainDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDomain} disabled={addingDomain || !newDomain.trim()}>
              {addingDomain ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Adicionar Domínio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

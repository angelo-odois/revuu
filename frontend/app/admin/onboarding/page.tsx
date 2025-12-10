"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/store";
import { api, PageTemplate } from "@/lib/api";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Layout,
  Palette,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingData {
  selectedTemplate: string | null;
  fullName: string;
  title: string;
  bio: string;
  avatarUrl: string;
  username: string;
}

const steps = [
  {
    id: "template",
    title: "Escolha seu template",
    subtitle: "Templates otimizados para cada profissão",
    icon: Layout,
  },
  {
    id: "personalize",
    title: "Personalize seu conteúdo",
    subtitle: "Adicione suas informações básicas",
    icon: Palette,
  },
  {
    id: "publish",
    title: "Publique e compartilhe",
    subtitle: "Escolha seu link personalizado",
    icon: Globe,
  },
];

// Fallback templates matching the landing page
const defaultTemplates = [
  {
    id: "modern",
    name: "Modern",
    slug: "modern",
    description: "Design limpo e moderno perfeito para designers",
    category: "cv" as const,
    profession: "Designer",
    color: "from-amber-500/30 to-orange-500/20",
  },
  {
    id: "classic",
    name: "Classic",
    slug: "classic",
    description: "Layout clássico ideal para desenvolvedores",
    category: "cv" as const,
    profession: "Desenvolvedor",
    color: "from-blue-500/30 to-cyan-500/20",
  },
  {
    id: "terminal",
    name: "Terminal",
    slug: "terminal",
    description: "Estilo terminal para devs e hackers",
    category: "cv" as const,
    profession: "Dev/Hacker",
    color: "from-green-500/30 to-emerald-500/20",
  },
  {
    id: "minimal",
    name: "Minimal",
    slug: "minimal",
    description: "Minimalista para destacar seu trabalho visual",
    category: "cv" as const,
    profession: "Fotógrafo",
    color: "from-gray-400/30 to-slate-400/20",
  },
  {
    id: "creative",
    name: "Creative",
    slug: "creative",
    description: "Criativo e expressivo para artistas",
    category: "cv" as const,
    profession: "Artista",
    color: "from-purple-500/30 to-pink-500/20",
  },
  {
    id: "corporate",
    name: "Corporate",
    slug: "corporate",
    description: "Profissional e sério para executivos",
    category: "cv" as const,
    profession: "Executivo",
    color: "from-indigo-500/30 to-violet-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, getValidToken, updateUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    selectedTemplate: null,
    fullName: "",
    title: "",
    bio: "",
    avatarUrl: "",
    username: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/admin");
    } else if (user.onboardingCompleted) {
      router.push("/admin/dashboard");
    } else {
      setData((prev) => ({
        ...prev,
        fullName: user.name || "",
        username: user.username || "",
      }));
    }
  }, [user, router]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const result = await api.getPageTemplates();
        // If API returns templates, use them. Otherwise use defaults
        if (result && result.length > 0) {
          setTemplates(result);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  // Check username availability
  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError("");
      return;
    }

    // Basic validation
    if (!/^[a-z0-9_-]+$/.test(username)) {
      setUsernameError("Use apenas letras minúsculas, números, - e _");
      return;
    }

    setCheckingUsername(true);
    try {
      const token = await getValidToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/users/check-username/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();

      if (!result.available) {
        setUsernameError("Este username já está em uso");
      } else {
        setUsernameError("");
      }
    } catch {
      // If endpoint doesn't exist, assume available
      setUsernameError("");
    } finally {
      setCheckingUsername(false);
    }
  };

  if (!user || user.onboardingCompleted) {
    return null;
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.selectedTemplate !== null;
      case 1:
        return data.fullName.trim() !== "";
      case 2:
        return data.username.trim() !== "" && !usernameError;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setSaving(true);
      const token = await getValidToken();
      if (!token) {
        setSaving(false);
        return;
      }

      try {
        // Save profile
        await api.saveProfile(
          {
            fullName: data.fullName,
            title: data.title,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            template: data.selectedTemplate || undefined,
          },
          token
        );

        // Update username if provided
        if (data.username) {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || ""}/api/users/username`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ username: data.username }),
            }
          );
        }

        // Create initial page from template
        if (data.selectedTemplate && data.selectedTemplate !== "blank") {
          await api.createPageFromTemplate(
            data.selectedTemplate,
            `${data.fullName} - Portfólio`,
            data.username || "home",
            token
          );
        }

        // Complete onboarding
        await api.completeOnboarding(token);
        updateUser({ onboardingCompleted: true, username: data.username });

        router.push("/admin/dashboard");
      } catch (error) {
        console.error("Error completing onboarding:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Template Selection
        return (
          <motion.div
            key="template"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Passo 1 de 3
              </span>
              <h2 className="text-3xl font-bold mt-4">Escolha um template</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Templates profissionais otimizados para destacar seu trabalho
              </p>
            </motion.div>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Use API templates if available, otherwise use defaults */}
                {(templates.length > 0 ? templates : defaultTemplates).map((template) => {
                  const defaultTemplate = defaultTemplates.find(t => t.slug === template.slug);
                  const color = defaultTemplate?.color || "from-amber-500/30 to-orange-500/20";
                  const profession = defaultTemplate?.profession || template.category;

                  return (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setData({ ...data, selectedTemplate: template.slug })
                      }
                      className={cn(
                        "relative cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-300",
                        data.selectedTemplate === template.slug
                          ? "border-amber-500 ring-4 ring-amber-500/20"
                          : "border-border/50 hover:border-amber-500/50"
                      )}
                    >
                      <div className={`aspect-[4/3] bg-gradient-to-br ${color} relative`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <h3 className="font-bold text-xl mb-1">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{profession}</p>
                          </div>
                        </div>
                        {data.selectedTemplate === template.slug && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="h-5 w-5 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        );

      case 1: // Personalization
        return (
          <motion.div
            key="personalize"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium mb-4">
                <Palette className="h-4 w-4" />
                Passo 2 de 3
              </span>
              <h2 className="text-3xl font-bold mt-4">Personalize seu conteúdo</h2>
              <p className="text-muted-foreground mt-2">
                Essas informações aparecerão no seu portfólio
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center">
              <ImageUpload
                value={data.avatarUrl}
                onChange={(url) => setData({ ...data, avatarUrl: url || "" })}
                aspectRatio="square"
                placeholder="Adicionar foto"
                className="w-32 h-32 rounded-full"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  placeholder="Seu nome completo"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Título Profissional</Label>
                <Input
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="Ex: Product Designer, Full Stack Developer"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  placeholder="Conte um pouco sobre você e sua carreira..."
                  rows={4}
                />
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              variants={itemVariants}
              className="p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl"
            >
              <p className="text-xs text-muted-foreground mb-3">PREVIEW</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                  {data.avatarUrl ? (
                    <Image
                      src={data.avatarUrl}
                      alt=""
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {data.fullName.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {data.fullName || "Seu Nome"}
                  </h3>
                  <p className="text-muted-foreground">
                    {data.title || "Seu título profissional"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case 2: // Publish
        return (
          <motion.div
            key="publish"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium mb-4">
                <Globe className="h-4 w-4" />
                Passo 3 de 3
              </span>
              <h2 className="text-3xl font-bold mt-4">Publique e compartilhe</h2>
              <p className="text-muted-foreground mt-2">
                Escolha o link personalizado do seu portfólio
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="space-y-2">
                <Label>Seu link personalizado</Label>
                <div className="flex items-stretch">
                  <div className="flex items-center px-4 bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground text-sm">
                    revuu.com.br/
                  </div>
                  <div className="relative flex-1">
                    <Input
                      value={data.username}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        setData({ ...data, username: value });
                        checkUsername(value);
                      }}
                      placeholder="seu-nome"
                      className="h-12 rounded-l-none"
                    />
                    {checkingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!checkingUsername &&
                      data.username &&
                      !usernameError &&
                      data.username.length >= 3 && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                  </div>
                </div>
                {usernameError && (
                  <p className="text-sm text-destructive">{usernameError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Mínimo de 3 caracteres. Use apenas letras, números, - e _
                </p>
              </div>
            </motion.div>

            {/* Final Preview */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-xl"
            >
              <div className="h-10 bg-muted/50 flex items-center gap-2 px-4 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 bg-background rounded-lg text-xs text-muted-foreground">
                    revuu.com.br/{data.username || "seu-nome"}
                  </div>
                </div>
              </div>
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden mb-4">
                  {data.avatarUrl ? (
                    <Image
                      src={data.avatarUrl}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {data.fullName.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold">
                  {data.fullName || "Seu Nome"}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {data.title || "Seu título profissional"}
                </p>
                {data.bio && (
                  <p className="text-sm text-muted-foreground mt-4 max-w-sm mx-auto">
                    {data.bio}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-600 dark:text-green-400">
                  Pronto para publicar!
                </p>
                <p className="text-muted-foreground">
                  Seu portfólio estará disponível em segundos.
                </p>
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-amber-500/10 opacity-20 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Image
            src="/revuuLogo.png"
            alt="Revuu"
            width={100}
            height={32}
            className="dark:invert"
          />
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
            Sair
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted
                          ? "rgb(34 197 94)"
                          : isActive
                          ? "rgb(245 158 11)"
                          : "rgb(229 231 235)",
                      }}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        (isActive || isCompleted) && "text-white"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        "text-sm mt-2 text-center hidden sm:block",
                        isActive
                          ? "text-amber-500 font-medium"
                          : isCompleted
                          ? "text-green-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-1 flex-1 mx-2 rounded-full transition-colors",
                        index < currentStep ? "bg-green-500" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between mt-12 pt-6 border-t max-w-xl mx-auto"
        >
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || saving}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <Button
            onClick={handleNext}
            disabled={saving || !canProceed()}
            className="bg-amber-500 hover:bg-amber-600 gap-2 min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Publicar
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

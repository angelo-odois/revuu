"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Lightbulb,
  FolderKanban,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Settings,
  BarChart3,
  Paintbrush,
  Crown,
  Globe,
  Key,
  HeadphonesIcon,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggleSimple } from "@/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface NavSection {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Curriculo",
    icon: User,
    items: [
      {
        title: "Perfil",
        href: "/admin/profile",
        icon: User,
      },
      {
        title: "Experiencias",
        href: "/admin/experiences",
        icon: Briefcase,
      },
      {
        title: "Formacao",
        href: "/admin/education",
        icon: GraduationCap,
      },
      {
        title: "Skills",
        href: "/admin/skills",
        icon: Lightbulb,
      },
    ],
  },
  {
    label: "Portfolio",
    icon: FolderKanban,
    items: [
      {
        title: "Projetos",
        href: "/admin/pages",
        icon: FolderKanban,
      },
      {
        title: "Aparencia",
        href: "/admin/templates",
        icon: Paintbrush,
      },
      {
        title: "Dominios",
        href: "/admin/domains",
        icon: Globe,
      },
    ],
  },
  {
    label: "Avancado",
    icon: Key,
    items: [
      {
        title: "Acesso API",
        href: "/admin/api-access",
        icon: Key,
      },
      {
        title: "Usuarios",
        href: "/admin/users",
        icon: Users,
        adminOnly: true,
      },
    ],
  },
  {
    label: "",
    items: [
      {
        title: "Meu Plano",
        href: "/admin/subscription",
        icon: Crown,
      },
      {
        title: "Suporte",
        href: "/admin/support",
        icon: HeadphonesIcon,
      },
      {
        title: "Configuracoes",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Close sidebar on route change and expand active section
  useEffect(() => {
    setIsOpen(false);

    // Find and expand the section that contains the active route
    const activeSection = navSections.find((section) =>
      section.label && section.items.some((item) =>
        pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href))
      )
    );

    if (activeSection?.label && !expandedSections.includes(activeSection.label)) {
      setExpandedSections((prev) => [...prev, activeSection.label]);
    }
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isItemActive = (href: string) => {
    return pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));
  };

  const isSectionActive = (section: NavSection) => {
    return section.items.some((item) => isItemActive(item.href));
  };

  const NavItemLink = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const isActive = isItemActive(item.href);

    const link = (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-amber-500/10 text-amber-600 shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            !isActive && "group-hover:scale-110"
          )}
        />
        {!collapsed && <span className="truncate">{item.title}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          {collapsed ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
              <span className="text-amber-600 font-bold text-lg">R</span>
            </div>
          ) : (
            <Image
              src="/revuuLogo.png"
              alt="Revuu"
              width={100}
              height={32}
              className="dark:invert"
            />
          )}
        </Link>
{!collapsed && (
          <div className="flex items-center gap-1">
            <ThemeToggleSimple />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto p-2 space-y-1", collapsed && "px-1")}>
        <TooltipProvider>
          {navSections.map((section, sectionIndex) => {
            // Filter out admin-only items for non-admin users
            const filteredItems = section.items.filter(
              (item) => !item.adminOnly || user?.role === "admin"
            );

            // Don't render section if no visible items
            if (filteredItems.length === 0) return null;

            // Sections without labels - render items directly
            if (!section.label) {
              return (
                <div key={sectionIndex} className="space-y-1">
                  {filteredItems.map((item) => (
                    <NavItemLink key={item.href} item={item} collapsed={collapsed} />
                  ))}
                </div>
              );
            }

            const sectionActive = isSectionActive(section);
            const isExpanded = expandedSections.includes(section.label);
            const SectionIcon = section.icon || FolderKanban;

            // Collapsed: show section icon as dropdown trigger
            if (collapsed) {
              return (
                <Tooltip key={sectionIndex} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        // Navigate to first item in section
                        const firstItem = filteredItems[0];
                        if (firstItem) {
                          router.push(firstItem.href);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center justify-center rounded-lg p-2.5 text-sm font-medium transition-all duration-200",
                        sectionActive
                          ? "bg-amber-500/10 text-amber-600"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <SectionIcon className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {section.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            // Expanded: show collapsible section
            return (
              <Collapsible
                key={sectionIndex}
                open={isExpanded}
                onOpenChange={() => toggleSection(section.label)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      sectionActive
                        ? "text-amber-600"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon className="h-4 w-4" />
                      <span>{section.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-4 pt-1">
                  {filteredItems.map((item) => (
                    <NavItemLink key={item.href} item={item} collapsed={false} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* User Section */}
      <div className={cn("border-t p-2", collapsed && "px-1")}>
        {user && (
          <>
            {collapsed ? (
              <TooltipProvider>
                <div className="space-y-1">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/u/${user.username || "admin"}`}
                        target="_blank"
                        className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Ver Curriculo</TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center rounded-lg p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Sair</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            ) : (
              <>
                <Link
                  href={`/u/${user.username || "admin"}`}
                  target="_blank"
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 mb-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Curriculo Publico
                </Link>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-semibold shrink-0">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{user.name || "Usuario"}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 shrink-0",
                          (!user.plan || user.plan === "free") &&
                            "border-gray-400 text-gray-500 bg-gray-50 dark:bg-gray-900",
                          user.plan === "pro" &&
                            "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950",
                          user.plan === "business" &&
                            "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950"
                        )}
                      >
                        {user.plan === "pro" ? "PRO" : user.plan === "business" ? "BUSINESS" : "GRATIS"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 bg-card border shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar - always expanded */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 border-r bg-card flex flex-col lg:hidden transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Desktop Sidebar - collapsible */}
      <aside
        className={cn(
          "group hidden lg:flex fixed left-0 top-0 z-40 h-screen border-r bg-card flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={isCollapsed} />

        {/* Floating Collapse Button */}
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "absolute top-20 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-md transition-all duration-300 hover:bg-muted",
                  "opacity-0 group-hover:opacity-100",
                  "hover:scale-110"
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {isCollapsed ? "Expandir" : "Recolher"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </aside>
    </>
  );
}

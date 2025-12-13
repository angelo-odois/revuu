import { getClientApiUrl } from "./config";

// Use centralized API URL configuration
const API_URL = getClientApiUrl();

interface FetchOptions extends RequestInit {
  token?: string;
}

export interface CustomDomain {
  id: string;
  userId: string;
  domain: string;
  status: "pending" | "active" | "error";
  verificationToken?: string;
  verifiedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; username: string }) =>
    fetchAPI<{ accessToken: string; refreshToken: string; user: unknown }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    fetchAPI<{ accessToken: string; refreshToken: string; user: unknown }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string, userId: string) =>
    fetchAPI<{ accessToken: string; refreshToken: string }>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken, userId }),
    }),

  getMe: (token: string) =>
    fetchAPI("/api/auth/me", { token }),

  completeOnboarding: (token: string) =>
    fetchAPI("/api/auth/complete-onboarding", {
      method: "POST",
      token,
    }),

  // Pages
  getPages: (status?: string) =>
    fetchAPI<unknown[]>(`/api/pages${status ? `?status=${status}` : ""}`),

  getMyPages: (token: string, status?: string) =>
    fetchAPI<unknown[]>(`/api/pages/my${status ? `?status=${status}` : ""}`, { token }),

  getPage: (slug: string) =>
    fetchAPI(`/api/pages/${slug}`),

  getPageById: (id: string, token: string) =>
    fetchAPI(`/api/pages/by-id/${id}`, { token }),

  createPage: (data: unknown, token: string) =>
    fetchAPI("/api/pages", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updatePage: (id: string, data: unknown, token: string) =>
    fetchAPI(`/api/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deletePage: (id: string, token: string) =>
    fetchAPI(`/api/pages/${id}`, {
      method: "DELETE",
      token,
    }),

  // Block Templates
  getBlockTemplates: () =>
    fetchAPI<unknown[]>("/api/admin/block-templates"),

  // Uploads
  uploadFile: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/api/admin/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  },

  getAssets: (token: string, page = 1, limit = 20) =>
    fetchAPI(`/api/admin/uploads?page=${page}&limit=${limit}`, { token }),

  // Profile
  getMyProfile: (token: string) =>
    fetchAPI("/api/profile/me", { token }),

  saveProfile: (data: unknown, token: string) =>
    fetchAPI("/api/profile", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  // Experiences
  getExperiences: (token: string) =>
    fetchAPI<unknown[]>("/api/experiences", { token }),

  createExperience: (data: unknown, token: string) =>
    fetchAPI("/api/experiences", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateExperience: (id: string, data: unknown, token: string) =>
    fetchAPI(`/api/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deleteExperience: (id: string, token: string) =>
    fetchAPI(`/api/experiences/${id}`, {
      method: "DELETE",
      token,
    }),

  reorderExperiences: (items: { id: string; order: number }[], token: string) =>
    fetchAPI("/api/experiences/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
      token,
    }),

  // Education
  getEducation: (token: string) =>
    fetchAPI<unknown[]>("/api/education", { token }),

  createEducation: (data: unknown, token: string) =>
    fetchAPI("/api/education", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateEducation: (id: string, data: unknown, token: string) =>
    fetchAPI(`/api/education/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deleteEducation: (id: string, token: string) =>
    fetchAPI(`/api/education/${id}`, {
      method: "DELETE",
      token,
    }),

  reorderEducation: (items: { id: string; order: number }[], token: string) =>
    fetchAPI("/api/education/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
      token,
    }),

  // Skills
  getSkills: (token: string) =>
    fetchAPI<unknown[]>("/api/skills", { token }),

  createSkill: (data: unknown, token: string) =>
    fetchAPI("/api/skills", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateSkill: (id: string, data: unknown, token: string) =>
    fetchAPI(`/api/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deleteSkill: (id: string, token: string) =>
    fetchAPI(`/api/skills/${id}`, {
      method: "DELETE",
      token,
    }),

  reorderSkills: (items: { id: string; order: number }[], token: string) =>
    fetchAPI("/api/skills/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
      token,
    }),

  // Projects
  getProjects: (token: string) =>
    fetchAPI<unknown[]>("/api/projects", { token }),

  createProject: (data: unknown, token: string) =>
    fetchAPI("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateProject: (id: string, data: unknown, token: string) =>
    fetchAPI(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deleteProject: (id: string, token: string) =>
    fetchAPI(`/api/projects/${id}`, {
      method: "DELETE",
      token,
    }),

  reorderProjects: (items: { id: string; order: number }[], token: string) =>
    fetchAPI("/api/projects/reorder", {
      method: "PUT",
      body: JSON.stringify({ items }),
      token,
    }),

  // Portfolio
  getPortfolio: (username: string) =>
    fetchAPI(`/api/portfolio/${username}`),

  updateUsername: (username: string, token: string) =>
    fetchAPI("/api/portfolio/username", {
      method: "PUT",
      body: JSON.stringify({ username }),
      token,
    }),

  checkUsername: (username: string, token: string) =>
    fetchAPI<{ available: boolean; reason?: string }>(`/api/portfolio/check-username/${username}`, { token }),

  // Account Settings
  changePassword: (currentPassword: string, newPassword: string, token: string) =>
    fetchAPI("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
      token,
    }),

  updateAvatar: (avatarUrl: string, token: string) =>
    fetchAPI("/api/auth/avatar", {
      method: "PUT",
      body: JSON.stringify({ avatarUrl }),
      token,
    }),

  deleteAccount: (password: string, token: string) =>
    fetchAPI("/api/auth/delete-account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
      token,
    }),

  // Page Templates
  getPageTemplates: () =>
    fetchAPI<PageTemplate[]>("/api/page-templates"),

  getPageTemplate: (slug: string) =>
    fetchAPI<PageTemplate>(`/api/page-templates/${slug}`),

  createPageFromTemplate: async (templateSlug: string, title: string, slug: string, token: string) => {
    // Get the template
    const template = await fetchAPI<PageTemplate>(`/api/page-templates/${templateSlug}`);

    // Create a new page with the template's content
    return fetchAPI("/api/pages", {
      method: "POST",
      body: JSON.stringify({
        title,
        slug,
        contentJSON: template.contentJSON,
        status: "draft",
      }),
      token,
    });
  },

  // Analytics
  trackView: (username: string, pageSlug?: string, referrer?: string) =>
    fetchAPI("/api/analytics/track", {
      method: "POST",
      body: JSON.stringify({ username, pageSlug, referrer }),
    }).catch(() => {}), // Silently fail - analytics should not break the page

  getAnalyticsOverview: (token: string, period: "7d" | "30d" | "90d" | "all" = "30d") =>
    fetchAPI<AnalyticsOverview>(`/api/analytics/overview?period=${period}`, { token }),

  getAnalyticsChart: (token: string, period: "7d" | "30d" | "90d" = "30d") =>
    fetchAPI<{ chartData: ChartDataPoint[] }>(`/api/analytics/chart?period=${period}`, { token }),

  getAnalyticsPages: (token: string, period: "7d" | "30d" | "90d" = "30d") =>
    fetchAPI<{ pages: PageAnalytics[] }>(`/api/analytics/pages?period=${period}`, { token }),

  // Subscription
  getPlans: <T = unknown[]>(token: string) =>
    fetchAPI<T>("/api/subscription/plans", { token }),

  getCurrentSubscription: <T = unknown>(token: string) =>
    fetchAPI<T>("/api/subscription/current", { token }),

  checkPlanLimit: (token: string) =>
    fetchAPI<{ canCreate: boolean; current: number; max: number; plan: string; upgradeRequired: boolean }>(
      "/api/subscription/check-limit",
      { token }
    ),

  upgradePlan: (plan: string, token: string) =>
    fetchAPI("/api/subscription/upgrade", {
      method: "POST",
      body: JSON.stringify({ plan }),
      token,
    }),

  cancelSubscription: (token: string) =>
    fetchAPI("/api/subscription/cancel", {
      method: "POST",
      token,
    }),

  openPortal: (token: string) =>
    fetchAPI<{ url: string }>("/api/subscription/portal", {
      method: "POST",
      token,
    }),

  getFeatures: (token: string) =>
    fetchAPI("/api/subscription/features", { token }),

  // Admin - User Management (admin only)
  getAdminUsers: (token: string, params?: { page?: number; limit?: number; search?: string; plan?: string; role?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.plan) searchParams.set("plan", params.plan);
    if (params?.role) searchParams.set("role", params.role);
    const query = searchParams.toString();
    return fetchAPI<AdminUsersResponse>(`/api/admin/users${query ? `?${query}` : ""}`, { token });
  },

  getAdminUsersStats: (token: string) =>
    fetchAPI<AdminUsersStats>("/api/admin/users/stats", { token }),

  getAdminUser: (id: string, token: string) =>
    fetchAPI<AdminUser>(`/api/admin/users/${id}`, { token }),

  updateAdminUser: (id: string, data: { plan?: string; role?: string; subscriptionStatus?: string }, token: string) =>
    fetchAPI<AdminUser>(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteAdminUser: (id: string, token: string) =>
    fetchAPI(`/api/admin/users/${id}`, {
      method: "DELETE",
      token,
    }),

  // Support Tickets - User
  getMyTickets: (token: string, params?: { status?: TicketStatus; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return fetchAPI<TicketsResponse>(`/api/support/tickets${query ? `?${query}` : ""}`, { token });
  },

  getTicket: (id: string, token: string) =>
    fetchAPI<Ticket>(`/api/support/tickets/${id}`, { token }),

  createTicket: (data: { subject: string; description: string; priority?: TicketPriority; category?: TicketCategory }, token: string) =>
    fetchAPI<Ticket>("/api/support/tickets", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  addTicketMessage: (ticketId: string, content: string, token: string, isInternal?: boolean) =>
    fetchAPI<TicketMessage>(`/api/support/tickets/${ticketId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, isInternal }),
      token,
    }),

  closeTicket: (ticketId: string, token: string) =>
    fetchAPI<Ticket>(`/api/support/tickets/${ticketId}/close`, {
      method: "POST",
      token,
    }),

  // Support Tickets - Admin
  getAdminTickets: (token: string, params?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    search?: string;
    assignedToMe?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.assignedToMe) searchParams.set("assignedToMe", "true");
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return fetchAPI<TicketsResponse>(`/api/support/admin/tickets${query ? `?${query}` : ""}`, { token });
  },

  getAdminTicketStats: (token: string) =>
    fetchAPI<TicketStats>("/api/support/admin/tickets/stats", { token }),

  updateAdminTicket: (id: string, data: { status?: TicketStatus; priority?: TicketPriority; assignedToId?: string | null }, token: string) =>
    fetchAPI<Ticket>(`/api/support/admin/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  assignTicketToMe: (ticketId: string, token: string) =>
    fetchAPI<Ticket>(`/api/support/admin/tickets/${ticketId}/assign`, {
      method: "POST",
      token,
    }),

  // Custom Domains
  getDomains: (token: string) =>
    fetchAPI<CustomDomain[]>("/api/domains", { token }),

  addDomain: (domain: string, token: string) =>
    fetchAPI<CustomDomain>("/api/domains", {
      method: "POST",
      body: JSON.stringify({ domain }),
      token,
    }),

  verifyDomain: (id: string, token: string) =>
    fetchAPI<CustomDomain>(`/api/domains/${id}/verify`, {
      method: "POST",
      token,
    }),

  deleteDomain: (id: string, token: string) =>
    fetchAPI(`/api/domains/${id}`, {
      method: "DELETE",
      token,
    }),
};

// Types for Page Templates
export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  slug: string;
  thumbnailUrl?: string;
  category: "cv" | "landing" | "links" | "other";
  contentJSON: {
    blocks: unknown[];
    meta?: Record<string, unknown>;
  };
  defaultTitle?: string;
  isPremium: boolean;
  order: number;
  isActive: boolean;
}

// Types for Analytics
export interface AnalyticsOverview {
  period: string;
  totalViews: number;
  portfolioViews: number;
  pageViews: number;
  uniqueVisitors: number;
  byDevice: { device: string; count: string }[];
  byBrowser: { browser: string; count: string }[];
  topReferrers: { referrer: string; count: string }[];
}

export interface ChartDataPoint {
  date: string;
  views: number;
}

export interface PageAnalytics {
  pageId: string;
  title: string;
  slug: string;
  views: string;
}

// Types for Admin User Management
export interface AdminUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: "admin" | "support" | "editor";
  plan: "free" | "pro" | "business";
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing";
  subscriptionStartedAt?: string;
  subscriptionEndsAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUsersStats {
  totalUsers: number;
  newUsersThisMonth: number;
  byPlan: Record<string, number>;
  byRole: Record<string, number>;
}

// Types for Support Tickets
export type TicketStatus = "open" | "in_progress" | "waiting_response" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "technical" | "billing" | "account" | "feature_request" | "bug_report" | "other";
export type MessageType = "user" | "support" | "system";

export interface TicketUser {
  id: string;
  name: string;
  email?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  user?: TicketUser;
  assignedToId?: string;
  assignedTo?: TicketUser;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  slaDeadline: string;
  slaBreach: boolean;
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId?: string;
  user?: TicketUser;
  content: string;
  type: MessageType;
  attachments?: string[];
  isInternal: boolean;
  createdAt: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TicketStats {
  totalOpen: number;
  totalResolved: number;
  totalClosed: number;
  slaBreached: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  avgResolutionTimeHours: string | null;
}

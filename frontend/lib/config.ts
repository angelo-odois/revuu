/**
 * Centralized application configuration
 *
 * This file contains all environment-specific configurations
 * that are shared across the application.
 */

// API Configuration
// In production, use empty string so requests go through Next.js rewrites
// In development, use localhost:3001 directly
export const getClientApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Check if we're in the browser and not localhost
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return ""; // Use relative URLs through Next.js rewrites
  }

  return "http://localhost:3001";
};

// For backward compatibility
export const API_URL = getClientApiUrl();

// Server-side API URL configuration is in server-api.ts

// Application metadata
export const APP_CONFIG = {
  name: "Revuu",
  tagline: "Portfolio Builder",
  defaultLocale: "pt-BR",
} as const;

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

// Upload limits
export const UPLOAD_LIMITS = {
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  pageContent: 60,
  staticAssets: 3600,
  portfolio: 0, // No cache for portfolios
} as const;

// Analytics periods
export const ANALYTICS_PERIODS = ["7d", "30d", "90d", "all"] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

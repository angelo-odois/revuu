/**
 * Server-side API configuration
 *
 * This file provides the correct API URL for server-side rendering (SSR).
 * In Docker/Coolify, use INTERNAL_API_URL for container-to-container communication.
 */

const DEVELOPMENT_API_URL = "http://localhost:3001";

/**
 * Get the API URL for server-side requests
 *
 * Priority:
 * 1. INTERNAL_API_URL (for Docker internal network - set to http://backend:3001 in Coolify)
 * 2. NEXT_PUBLIC_API_URL (public API URL)
 * 3. Development URL as fallback
 *
 * For Coolify deployment, set INTERNAL_API_URL=http://backend:3001 on the frontend service
 */
export function getServerApiUrl(): string {
  // For Docker/Coolify: use internal network URL
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }

  // Public API URL (also works for SSR if backend is accessible)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback for local development
  return DEVELOPMENT_API_URL;
}

/**
 * Make a server-side API request with proper error handling
 */
export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  const apiUrl = getServerApiUrl();
  const url = `${apiUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      console.error(`Server fetch failed: ${response.status} ${response.statusText} for ${url}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Server fetch error for ${url}:`, error);
    return null;
  }
}

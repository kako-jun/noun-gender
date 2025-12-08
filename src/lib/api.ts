// API configuration for Cloudflare deployment
// In production, API_BASE_URL points to the Cloudflare Workers API
// In development, it can be left empty to use the local Next.js API routes

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path);
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

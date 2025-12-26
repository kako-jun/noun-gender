// API configuration for Next.js API Routes
// All APIs are served from the same origin via Next.js App Router

export function getApiUrl(path: string): string {
  // Ensure path starts with /
  return path.startsWith('/') ? path : `/${path}`;
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = getApiUrl(path);
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

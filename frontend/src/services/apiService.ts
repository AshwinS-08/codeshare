/* Frontend API service to talk to our Flask backend */

import type { ShareCreateResponse, ShareRetrieveResponse, UserShare } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL || window.location.origin;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed with ${res.status}`;
    try {
      const json = await res.json();
      if (json?.error) msg = json.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export const apiService = {
  async getShareByCode(code: string): Promise<ShareRetrieveResponse> {
    const res = await fetch(`${API_BASE}/api/shares/${encodeURIComponent(code)}`);
    return handleResponse<ShareRetrieveResponse>(res);
  },

  async createShare(opts: { text?: string; file?: File }): Promise<ShareCreateResponse> {
    // Prefer multipart when there's a file; else JSON
    const authHeaders = await getAuthHeaders();
    if (opts.file) {
      const form = new FormData();
      form.append("file", opts.file);
      const res = await fetch(`${API_BASE}/api/shares`, {
        method: "POST",
        body: form,
        headers: authHeaders,
        credentials: 'include',
      });
      return handleResponse<ShareCreateResponse>(res);
    } else {
      const res = await fetch(`${API_BASE}/api/shares`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: opts.text }),
        credentials: 'include',
      });
      return handleResponse<ShareCreateResponse>(res);
    }
  },

  async downloadFile(fileUrl: string): Promise<Blob> {
    const url = new URL(`${API_BASE}/api/files/fetch`);
    url.searchParams.set('url', fileUrl);
    const res = await fetch(url.toString(), {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Download failed with ${res.status}`);
    return res.blob();
  },

  async getMyStats(): Promise<{ total_shares: number; total_views: number }> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/me/stats`, {
      method: "GET",
      headers: authHeaders,
      credentials: 'include',
    });
    return handleResponse<{ total_shares: number; total_views: number }>(res);
  },

  async getMyShares(): Promise<{ shares: UserShare[] }> {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/me/shares`, {
      method: 'GET',
      headers: authHeaders,
      credentials: 'include',
    });
    return handleResponse<{ shares: UserShare[] }>(res);
  },
};

export default apiService;
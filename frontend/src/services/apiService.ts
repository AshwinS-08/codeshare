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
  async getShareByCode(code: string, password?: string): Promise<ShareRetrieveResponse> {
    const url = new URL(`${API_BASE}/api/shares/${encodeURIComponent(code)}`);
    if (password) {
      url.searchParams.set("password", password);
    }
    const res = await fetch(url.toString());
    return handleResponse<ShareRetrieveResponse>(res);
  },

  async createShare(opts: { text?: string; file?: File; password?: string; metadata?: Record<string, any> }): Promise<ShareCreateResponse> {
    // Prefer multipart when there's a file; else JSON
    const authHeaders = await getAuthHeaders();
    if (opts.file) {
      const form = new FormData();
      form.append("file", opts.file);
      if (typeof opts.text === "string" && opts.text.length > 0) {
        form.append("text", opts.text);
      }
      if (opts.password) {
        form.append("password", opts.password);
      }
      if (opts.metadata) {
        form.append("metadata", JSON.stringify(opts.metadata));
      }
      const res = await fetch(`${API_BASE}/api/shares`, {
        method: "POST",
        body: form,
        headers: authHeaders,
        credentials: 'include',
      });
      return handleResponse<ShareCreateResponse>(res);
    } else {
      const body: any = { text: opts.text };
      if (opts.password) {
        body.password = opts.password;
      }
      if (opts.metadata) {
        body.metadata = opts.metadata;
      }
      const res = await fetch(`${API_BASE}/api/shares`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
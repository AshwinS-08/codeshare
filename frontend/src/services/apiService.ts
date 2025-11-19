/* Frontend API service to talk to our Flask backend */

import type { ShareCreateResponse, ShareRetrieveResponse } from "./types";

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

export const apiService = {
  async getShareByCode(code: string): Promise<ShareRetrieveResponse> {
    const res = await fetch(`${API_BASE}/api/shares/${encodeURIComponent(code)}`);
    return handleResponse<ShareRetrieveResponse>(res);
  },

  async createShare(opts: { text?: string; file?: File }): Promise<ShareCreateResponse> {
    // Prefer multipart when there's a file; else JSON
    if (opts.file) {
      const form = new FormData();
      form.append("file", opts.file);
      if (opts.text) form.append("text", opts.text);
      const res = await fetch(`${API_BASE}/api/shares`, { method: "POST", body: form });
      return handleResponse<ShareCreateResponse>(res);
    } else {
      const res = await fetch(`${API_BASE}/api/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: opts.text || null }),
      });
      return handleResponse<ShareCreateResponse>(res);
    }
  },

  async downloadFile(fileUrl: string): Promise<Blob> {
    const url = new URL(`${API_BASE}/api/files/fetch`);
    url.searchParams.set('url', fileUrl);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Download failed with ${res.status}`);
    return res.blob();
  }
};

export default apiService;
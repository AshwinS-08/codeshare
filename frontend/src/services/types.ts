// Types aligned with backend/application.py response shapes

export interface ShareRetrieveResponse {
  id: string;
  code: string;
  content_type: 'text' | 'file';
  text_content: string | null;
  file_name: string | null;
  file_size: number | null;
  file_url: string | null;
  created_at: string;
  expires_at: string;
  max_views: number | null;
  views: number;
}

export interface ShareCreateResponse {
  status: 'ok';
  code: string;
  content_type: 'text' | 'file';
  text_content: string | null;
  file_name: string | null;
  file_size: number | null;
  file_url: string | null;
  row?: unknown;
}

export interface ShareRequest {
  content_type: 'text' | 'file';
  text_content?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_url?: string | null;
  expiry_hours?: number;
  max_views?: number | null;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, string>;
}
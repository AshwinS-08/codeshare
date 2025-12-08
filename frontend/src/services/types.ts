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
  view_count: number;
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

export interface UserShare {
  code: string;
  content_type: 'text' | 'file';
  file_name: string | null;
  file_size: number | null;
  file_url: string | null;
  created_at?: string;
  view_count?: number;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, string>;
}

export interface AnalyticsData {
  total_shares: number;
  total_views: number;
  avg_views: number;
  recent_shares: number;
  content_types: Record<string, number>;
  views_by_date: Record<string, number>;
  top_shares: Array<{
    code: string;
    views: number;
    type: string;
    name: string;
  }>;
}

export interface ActivityItem {
  type: 'share_created' | 'share_viewed';
  action: string;
  item: string;
  code: string;
  timestamp: string;
  icon: string;
}

export interface ActivityResponse {
  activities: ActivityItem[];
}

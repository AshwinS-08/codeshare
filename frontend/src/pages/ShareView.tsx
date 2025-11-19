import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiService, API_BASE } from '../services/apiService';
import { FileText, Download, ArrowLeft, Clock, Copy } from 'lucide-react';

interface ShareData {
  id: string;
  code: string;
  content_type: string;
  text_content?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  created_at: string;
  expires_at: string;
  views: number;
  max_views?: number;
}

export default function ShareView() {
  const { code } = useParams<{ code: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<'image' | 'pdf' | 'text' | 'other'>('other');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchShareData = async () => {
      if (!code) {
        setError('Invalid share code');
        setLoading(false);
        return;
      }

        try {
          const data = await apiService.getShareByCode(code);
          setShareData(data as ShareData);
          setLoading(false);
        } catch (err) {
        setError('Failed to load share');
        setLoading(false);
      }
    };

    fetchShareData();
  }, [code]);

  // Auto-preview files by default once the share data is loaded
  useEffect(() => {
    // reset preview state when share changes
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(false);

    if (!shareData) return;
    if (shareData.content_type !== 'file') return;
    if (!shareData.file_name) return;

    let createdUrl: string | null = null;
    const run = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);
        
        // Use file_url if available, otherwise construct fallback URL
        let fileUrl = shareData.file_url;
        if (!fileUrl && shareData.file_name) {
          // Try to construct a fallback URL using the file name
          // Assume the file was uploaded with code prefix
          const codePrefix = shareData.code;
          const potentialPath = shareData.file_name.startsWith(codePrefix) ? shareData.file_name : `${codePrefix}-${shareData.file_name}`;
          fileUrl = `proxy:shared-files/${potentialPath}`;
        }
        
        if (!fileUrl) {
          setPreviewError('File URL not available');
          return;
        }
        
        const blob = await apiService.downloadFile(fileUrl);
        const url = window.URL.createObjectURL(blob);
        createdUrl = url;
        setPreviewUrl(url);
        setPreviewKind(inferPreviewKind(shareData.file_name, blob.type));
      } catch {
        setPreviewError('Preview not available');
      } finally {
        setPreviewLoading(false);
      }
    };
    run();
    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [shareData]);

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const downloadFile = async () => {
    if (!shareData?.file_name) return;

    try {
      // Use file_url if available, otherwise construct fallback URL
      let fileUrl = shareData.file_url;
      if (!fileUrl && shareData.file_name) {
        // Try to construct a fallback URL using the file name
        // Assume the file was uploaded with code prefix
        const codePrefix = shareData.code;
        const potentialPath = shareData.file_name.startsWith(codePrefix) ? shareData.file_name : `${codePrefix}-${shareData.file_name}`;
        fileUrl = `proxy:shared-files/${potentialPath}`;
      }
      
      if (!fileUrl) {
        throw new Error('File URL not available');
      }

      // Use the backend proxy endpoint for downloading
      const fetchUrl = new URL(`${API_BASE}/api/files/fetch`);
      fetchUrl.searchParams.set('url', fileUrl);
      
      const response = await fetch(fetchUrl.toString());
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = shareData.file_name || 'download';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 1000);
      
      toast({ title: 'Download started' });
    } catch (err) {
      console.error('Download failed:', err);
      toast({
        title: 'Download failed',
        description: 'Could not download the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const inferPreviewKind = (name?: string, mime?: string): 'image' | 'pdf' | 'text' | 'other' => {
    const n = (name || '').toLowerCase();
    const m = (mime || '').toLowerCase();
    if (m.startsWith('image/') || /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)$/.test(n)) return 'image';
    if (m === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
    if (m.startsWith('text/') || /(\.txt|\.md|\.csv|\.log|\.json|\.xml|\.yaml|\.yml|\.html|\.css|\.js|\.ts)$/.test(n)) return 'text';
    return 'other';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeRemaining = () => {
    if (!shareData) return '';
    const now = new Date();
    const expires = new Date(shareData.expires_at);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl">😔</div>
          <h1 className="text-2xl font-bold">Share Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="rounded-full">
            <Link to="/">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              👁️ {shareData?.views} views
            </div>
            <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              {getTimeRemaining()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Shared Content</h1>
            <p className="text-muted-foreground">Code: {shareData?.code}</p>
          </div>

          {shareData?.content_type === 'text' ? (
            <Card className="p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Text Content</span>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {shareData.text_content}
                  </pre>
                </div>
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!shareData?.text_content) return;
                      navigator.clipboard.writeText(shareData.text_content).then(() => {
                        toast({ title: 'Text copied to clipboard' });
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">File Share</span>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg space-y-3 border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{shareData?.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {shareData?.file_size ? formatFileSize(shareData.file_size) : 'Unknown size'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={downloadFile} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  {(previewLoading || previewUrl || previewError) && (
                    <div className="mt-3 bg-background rounded-lg p-3 border">
                      {previewLoading && (
                        <div className="w-full h-40 flex items-center justify-center text-sm text-muted-foreground">
                          Loading preview...
                        </div>
                      )}
                      {previewError && !previewLoading && (
                        <p className="text-sm text-muted-foreground">{previewError}</p>
                      )}
                      {previewKind === 'image' && (
                        <img src={previewUrl || undefined} alt={shareData?.file_name || 'preview'} className="max-h-80 mx-auto rounded-md" />
                      )}
                      {previewKind === 'pdf' && (
                        <object data={previewUrl || undefined} type="application/pdf" className="w-full h-80 rounded-md" />
                      )}
                      {previewKind === 'text' && (
                        <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            Preview of {shareData?.file_name}
                          </pre>
                        </div>
                      )}
                      {previewKind === 'other' && (
                        <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Share Info */}
          <Card className="p-4 bg-muted/50 rounded-xl">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Shared on {new Date(shareData?.created_at || '').toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                This content will be automatically deleted when it expires
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
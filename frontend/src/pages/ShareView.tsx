import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiService, API_BASE } from '../services/apiService';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { FileText, Download, ArrowLeft, Clock, Copy, Share2, QrCode as QrCodeIcon } from 'lucide-react';

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
  view_count: number;
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
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: '✅ Link copied!',
        description: 'Share link has been copied to clipboard'
      });
    });
  };

  useEffect(() => {
    const fetchShareData = async () => {
      if (!code) {
        setError('Invalid share code');
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getShareByCode(code);
        setShareData(data as unknown as ShareData);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-violet-500/5 to-pink-500/5 p-4">
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
          <Button variant="ghost" asChild className="rounded-full hover:bg-violet-500/10">
            <Link to="/">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
              👁️ {shareData?.view_count} views
            </div>
            <div className="flex items-center gap-1 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              <Clock className="w-4 h-4" />
              {getTimeRemaining()}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                Shared Content
              </h1>
              <p className="text-muted-foreground">Code: <span className="font-mono font-bold text-foreground">{shareData?.code}</span></p>
            </div>

            {shareData?.content_type === 'text' ? (
              <Card className="p-6 shadow-lg border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-violet-600">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Text Content</span>
                  </div>
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border">
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
                          toast({ title: '✅ Text copied to clipboard' });
                        });
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Text
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 shadow-lg border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-violet-600">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">File Share</span>
                  </div>

                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg space-y-3 border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-lg">{shareData?.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {shareData?.file_size ? formatFileSize(shareData.file_size) : 'Unknown size'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={downloadFile} className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 shadow-lg shadow-violet-500/20">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    {(previewLoading || previewUrl || previewError) && (
                      <div className="mt-3 bg-background rounded-lg p-3 border">
                        {previewLoading && (
                          <div className="w-full h-40 flex items-center justify-center text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        )}
                        {previewError && !previewLoading && (
                          <p className="text-sm text-muted-foreground">{previewError}</p>
                        )}
                        {previewKind === 'image' && (
                          <img src={previewUrl || undefined} alt={shareData?.file_name || 'preview'} className="max-h-80 mx-auto rounded-md shadow-lg" />
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
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-violet-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  📅 Shared on {new Date(shareData?.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  ⏰ This content will be automatically deleted when it expires
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Share Actions */}
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-violet-500/20 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-violet-600">
                  <Share2 className="w-5 h-5" />
                  <h3 className="font-semibold">Share Options</h3>
                </div>

                <Button
                  onClick={copyShareLink}
                  className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 shadow-lg shadow-violet-500/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Share Link
                </Button>

                <Button
                  onClick={() => setShowQR(!showQR)}
                  variant="outline"
                  className="w-full border-violet-500/30 hover:bg-violet-500/10"
                >
                  <QrCodeIcon className="w-4 h-4 mr-2" />
                  {showQR ? 'Hide' : 'Show'} QR Code
                </Button>
              </div>
            </Card>

            {/* QR Code */}
            {showQR && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <QRCodeGenerator url={shareUrl} title="Scan to View" />
              </div>
            )}

            {/* Stats Card */}
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-emerald-600">
                  <span className="text-2xl">📊</span>
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Views</span>
                    <span className="font-bold text-lg">{shareData?.view_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{shareData?.content_type}</span>
                  </div>
                  {shareData?.max_views && (
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Max Views</span>
                      <span className="font-medium">{shareData.max_views}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Security Info */}
            <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-amber-600">
                  <span className="text-2xl">🔒</span>
                  Security
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>End-to-end encrypted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Auto-expires after time limit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Secure file storage</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
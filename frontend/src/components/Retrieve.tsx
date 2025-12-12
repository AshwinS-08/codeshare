import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Search, AlertCircle, Eye, Lock } from 'lucide-react';
import { apiService, PasswordRequiredError } from '@/services/apiService';
import type { ShareRetrieveResponse } from '@/services/types';

type PreviewKind = 'image' | 'pdf' | 'text' | 'other';

export const Retrieve = () => {
  const [code, setCode] = useState('');
  const [share, setShare] = useState<ShareRetrieveResponse | null>(null);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<PreviewKind>('other');

  // Password protection state
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');

  const { toast } = useToast();

  const handleRetrieve = async () => {
    if (!code.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter a 6-character code to retrieve content",
        variant: "destructive"
      });
      return;
    }

    setIsRetrieving(true);
    setError('');
    setPreviewUrl(null);
    try {
      // Pass password if required
      const res = await apiService.getShareByCode(
        code.trim().toUpperCase(),
        isPasswordRequired ? password : undefined
      );
      setShare(res);
      setIsPasswordRequired(false); // Reset on success
      setPassword('');
      toast({ title: 'Content retrieved!', description: 'Successfully found the shared content' });
    } catch (err) {
      if (err instanceof PasswordRequiredError) {
        setIsPasswordRequired(true);
        setError('');
        // Don't show toast for password requirement, the UI will update
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve content. Please try again.';
        setError(msg);
        setShare(null);
        toast({ title: 'Retrieval failed', description: msg, variant: 'destructive' });
      }
    } finally {
      setIsRetrieving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const reset = () => {
    setCode('');
    setShare(null);
    setError('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const inferPreviewKind = (name?: string | null, mime?: string | null): PreviewKind => {
    const n = (name || '').toLowerCase();
    const m = (mime || '').toLowerCase();
    if (m.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(n)) return 'image';
    if (m === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
    if (m.startsWith('text/') || /\.(txt|md|csv|log|json|xml|yaml|yml|html|css|js|ts)$/.test(n)) return 'text';
    return 'other';
  };

  const handlePreview = async () => {
    if (!share || share.content_type !== 'file' || !share.file_url) return;
    try {
      const blob = await apiService.downloadFile(share.file_url);
      const url = URL.createObjectURL(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      setPreviewKind(inferPreviewKind(share.file_name, blob.type || null));
      toast({ title: 'Preview ready' });
    } catch (err) {
      toast({ title: 'Preview failed', description: err instanceof Error ? err.message : 'Could not preview file', variant: 'destructive' });
    }
  };

  const handleDownload = async () => {
    if (!share || share.content_type !== 'file' || !share.file_url) return;
    try {
      const blob = await apiService.downloadFile(share.file_url);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = share.file_name || `download-${share.code}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke after a short delay to allow the download to start
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      toast({ title: 'Download failed', description: err instanceof Error ? err.message : 'Could not download file', variant: 'destructive' });
    }
  };

  if (share) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-green-600">Content Retrieved!</h2>
          <p className="text-muted-foreground">Here's the shared content</p>
        </div>

        <Card className="p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {share.content_type === 'file' ? (
                <FileText className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>
                {share.content_type === 'file' ? 'File' : 'Text'} •
                Shared on {formatDate(share.created_at)}
              </span>
            </div>

            {share.content_type === 'file' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{share.file_name}</h3>
                  <p className="text-muted-foreground">
                    {share.file_size ? formatFileSize(share.file_size) : null}
                  </p>
                </div>
                {/* Preview Area */}
                {previewUrl ? (
                  <div className="bg-muted p-4 rounded-lg border">
                    {previewKind === 'image' && (
                      <img src={previewUrl} alt={share.file_name || 'preview'} className="max-h-80 mx-auto rounded-md" />
                    )}
                    {previewKind === 'pdf' && (
                      <object data={previewUrl} type="application/pdf" className="w-full h-80 rounded-md" />
                    )}
                    {previewKind === 'text' && (
                      <div className="bg-background p-3 rounded-md max-h-60 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          Preview of {share.file_name}
                        </pre>
                      </div>
                    )}
                    {previewKind === 'other' && (
                      <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">
                      Click Preview to fetch a secure preview, or Download to save the file.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Shared Text</h3>
                <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {share.text_content}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {share.content_type === 'file' ? (
                <>
                  <Button className="flex-1" variant="secondary" onClick={handlePreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button className="flex-1" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </>
              ) : (
                <Button className="flex-1" onClick={() => {
                  if (!share?.text_content) return;
                  navigator.clipboard.writeText(share.text_content).then(() => {
                    toast({ title: 'Text copied to clipboard' });
                  });
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              )}
              <Button variant="outline" onClick={reset}>
                Retrieve Another
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Retrieve Content</h2>
        <p className="text-muted-foreground">Enter a 6-character code to access shared content</p>
      </div>

      <div className="space-y-4">
        {isPasswordRequired ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <div className="text-center space-y-4">
                <div className="flex justify-center text-amber-600 dark:text-amber-500">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-amber-800 dark:text-amber-200">Password Protected</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This content is protected. Please enter the password to view it.
                  </p>
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white dark:bg-slate-950"
                    onKeyDown={(e) => e.key === 'Enter' && handleRetrieve()}
                  />
                  <Button
                    onClick={handleRetrieve}
                    className="w-full"
                    disabled={isRetrieving || !password}
                  >
                    {isRetrieving ? 'Unlocking...' : 'Unlock Content'}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsPasswordRequired(false);
                    setPassword('');
                    setError('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="retrieve-code" className="text-base font-medium">Enter Code</Label>
              <Input
                id="retrieve-code"
                type="text"
                placeholder="ABC123"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-wider h-14 rounded-xl border-muted-foreground/20"
                onKeyDown={(e) => e.key === 'Enter' && handleRetrieve()}
              />
            </div>

            {error && (
              <Card className="p-4 bg-destructive/10 border-destructive/20 rounded-xl animate-in fade-in duration-300">
                <div className="flex items-start gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              </Card>
            )}

            <Button
              onClick={handleRetrieve}
              disabled={isRetrieving || code.length !== 6}
              className="w-full h-12 text-lg font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
              size="lg"
            >
              {isRetrieving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Retrieving...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Retrieve Content
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {!isPasswordRequired && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Codes are case-insensitive and expire after 24 hours
          </p>
        </div>
      )}
    </div>
  );
};
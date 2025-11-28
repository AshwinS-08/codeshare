import { useEffect, useState } from "react";
import { apiService } from "@/services/apiService";
import type { UserShare } from "@/services/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const UserShares = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shares, setShares] = useState<UserShare[]>([]);
  const [previewShare, setPreviewShare] = useState<UserShare | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiService.getMyShares();
        if (cancelled) return;
        setShares(data.shares || []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load your uploads");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        Loading your uploads...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 text-sm text-destructive">
        {error}
      </Card>
    );
  }

  if (!shares.length) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        You do not have any uploads linked to your account yet.
      </Card>
    );
  }

  const formatSize = (size: number | null | undefined) => {
    if (!size || size <= 0) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const handleOpen = async (share: UserShare) => {
    if (!share.file_url) return;
    try {
      const blob = await apiService.downloadFile(share.file_url);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/share/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Share link copied to clipboard" });
  };

  const handlePreview = async (share: UserShare) => {
    if (!share.file_url) return;
    try {
      const blob = await apiService.downloadFile(share.file_url);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewShare(share);
    } catch (e) {
      toast({ title: "Preview failed", description: "Could not load file preview", variant: "destructive" });
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewShare(null);
  };

  const inferPreviewKind = (name?: string | null) => {
    const n = (name || '').toLowerCase();
    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(n)) return 'image';
    if (n.endsWith('.pdf')) return 'pdf';
    if (/\.(txt|md|csv|log|json|xml|yaml|yml|html|css|js|ts)$/.test(n)) return 'text';
    return 'other';
  };

  return (
    <Card className="p-4 md:p-6 text-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="font-medium text-base">Your uploads</div>
        <div className="text-xs text-muted-foreground">
          Showing {shares.length} item{shares.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 md:mx-0">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left font-normal">Code</th>
              <th className="px-2 py-2 text-left font-normal">Name</th>
              <th className="px-2 py-2 text-left font-normal">Size</th>
              <th className="px-2 py-2 text-left font-normal">Created</th>
              <th className="px-2 py-2 text-left font-normal">Views</th>
              <th className="px-2 py-2 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((share) => (
              <tr key={share.code} className="border-b last:border-0">
                <td className="px-2 py-2 align-middle font-mono text-xs">
                  {share.code}
                </td>
                <td className="px-2 py-2 align-middle">
                  {share.file_name || "(text only)"}
                </td>
                <td className="px-2 py-2 align-middle whitespace-nowrap">
                  {formatSize(share.file_size ?? null)}
                </td>
                <td className="px-2 py-2 align-middle whitespace-nowrap">
                  {formatDate(share.created_at)}
                </td>
                <td className="px-2 py-2 align-middle text-center">
                  {share.view_count ?? 0}
                </td>
                <td className="px-2 py-2 align-middle text-right">
                  {share.file_url && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleCopyLink(share.code)}
                        title="Copy Link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handlePreview(share)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleOpen(share)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!previewShare} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewShare?.file_name || 'Preview'}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewUrl && previewShare && (
              <>
                {inferPreviewKind(previewShare.file_name) === 'image' && (
                  <img src={previewUrl} alt="Preview" className="max-w-full h-auto mx-auto rounded-md" />
                )}
                {inferPreviewKind(previewShare.file_name) === 'pdf' && (
                  <iframe src={previewUrl} className="w-full h-[60vh] rounded-md" />
                )}
                {inferPreviewKind(previewShare.file_name) === 'text' && (
                  <iframe src={previewUrl} className="w-full h-[60vh] bg-white rounded-md" />
                )}
                {inferPreviewKind(previewShare.file_name) === 'other' && (
                  <div className="text-center py-10 text-muted-foreground">
                    Preview not available for this file type.
                    <br />
                    <Button variant="link" onClick={() => handleOpen(previewShare)}>Download to view</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

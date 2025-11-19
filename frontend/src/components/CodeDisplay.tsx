import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, RotateCcw, Clock, Share, ExternalLink } from 'lucide-react';

interface CodeDisplayProps {
  code: string;
  onReset: () => void;
}

export const CodeDisplay = ({ code, onReset }: CodeDisplayProps) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/share/${code}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast({
        title: "Code copied!",
        description: "Share this code with others",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive"
      });
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedUrl(true);
      toast({
        title: "Share URL copied!",
        description: "Anyone with this link can access your content",
      });
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive"
      });
    }
  };

  const openShare = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-green-600">Content Shared!</h2>
        <p className="text-muted-foreground">Your content is now available via code or direct link</p>
      </div>

      {/* Code Display */}
      <Card className="p-6 bg-code-bg border-code-border shadow-sm">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Share Code</h3>
            <div className="text-5xl font-mono font-bold tracking-wider text-primary mb-5 bg-secondary/50 py-4 rounded-lg">
              {code}
            </div>
            <Button
              onClick={copyCode}
              variant="default"
              className="w-full"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Code Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Direct Share Link</h3>
            <div className="bg-muted/50 p-4 rounded-md text-sm font-mono break-all mb-4 border">
              {shareUrl}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={copyShareUrl}
                className="w-full"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              
              <Button
                onClick={openShare}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Expiration Notice */}
      <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
        <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
          <Clock className="w-5 h-5" />
          <span className="text-sm font-medium">
            This code will expire in 24 hours
          </span>
        </div>
      </Card>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={onReset}
        className="w-full"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Share Something Else
      </Button>
    </div>
  );
};
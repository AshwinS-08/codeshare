import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Copy, Check } from 'lucide-react';
import { CodeDisplay } from '@/components/CodeDisplay';
import { apiService } from '@/services/apiService';

export const Share = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<'image' | 'pdf' | 'text' | 'other'>('other');
  const { toast } = useToast();

  const generateCode = () => {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleFileUpload = useCallback((uploadedFile: File) => {
    // Limit file size to 10MB
    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(uploadedFile);
    setText(''); // Clear text when file is uploaded
    toast({
      title: "File uploaded",
      description: `${uploadedFile.name} ready to share`,
    });
  }, [toast]);

  // Infer preview kind based on filename and mime
  const inferPreviewKind = (name?: string, mime?: string): 'image' | 'pdf' | 'text' | 'other' => {
    const n = (name || '').toLowerCase();
    const m = (mime || '').toLowerCase();
    if (m.startsWith('image/') || /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)$/.test(n)) return 'image';
    if (m === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
    if (m.startsWith('text/') || /(\.txt|\.md|\.csv|\.log|\.json|\.xml|\.yaml|\.yml|\.html|\.css|\.js|\.ts)$/.test(n)) return 'text';
    return 'other';
  };

  // Create a preview URL whenever file changes; cleanup previous
  useEffect(() => {
    if (!file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setPreviewKind('other');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewKind(inferPreviewKind(file.name, file.type));
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleShare = async () => {
    if (!file && !text.trim()) {
      toast({
        title: "Nothing to share",
        description: "Please upload a file or enter some text",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const code = generateCode();
  let fileUrl: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

      // Handle file upload if there's a file
      if (file) {
        // We now delegate file upload to the backend
        const res = await apiService.createShare({ file, text });
        setGeneratedCode(res.code);
        toast({ title: "Content uploaded!", description: "Your content is ready to share" });
        setIsGenerating(false);
        return;
      }

      // Text-only share via backend
      const res = await apiService.createShare({ text });
      setGeneratedCode(res.code);
      toast({ title: "Content uploaded!", description: "Your content is ready to share" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setFile(null);
    setText('');
    setGeneratedCode('');
  };

  if (generatedCode) {
    return <CodeDisplay code={generatedCode} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Share Your Content</h2>
        <p className="text-muted-foreground">Upload a file or enter text to generate a shareable code</p>
      </div>

      {/* File Upload Area */}
      <Card 
        className={`relative border-2 border-dashed transition-all duration-200 ${
          isDragging 
            ? 'border-primary bg-upload-hover' 
            : 'border-upload-border bg-upload-area hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {file ? file.name : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Maximum file size: 10MB'}
            </p>
          </label>
          {file && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setFile(null)}
            >
              Remove File
            </Button>
          )}

          {previewUrl && (
            <div className="mt-6 text-left">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="bg-background border rounded p-2">
                {previewKind === 'image' && (
                  <img src={previewUrl} alt={file?.name || 'preview'} className="max-h-96 mx-auto rounded" />
                )}
                {previewKind === 'pdf' && (
                  <object data={previewUrl} type="application/pdf" className="w-full h-96 rounded" />
                )}
                {previewKind === 'text' && (
                  <iframe src={previewUrl} title="preview" className="w-full h-80 bg-background rounded" />
                )}
                {previewKind === 'other' && (
                  <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="text-center text-muted-foreground font-medium">OR</div>

      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="text-content" className="text-base font-medium">Enter Text</Label>
        <Textarea
          id="text-content"
          placeholder="Paste your text here..."
          value={text}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
            if (e.target.value.trim() && file) {
              setFile(null); // Clear file when text is entered
            }
          }}
          className="min-h-[120px] resize-none"
          disabled={!!file}
        />
        {text && (
          <p className="text-sm text-muted-foreground">
            {text.length} characters
          </p>
        )}
      </div>

      {/* Generate Button */}
      <Button 
        onClick={handleShare}
        disabled={isGenerating || (!file && !text.trim())}
        className="w-full h-12 text-lg font-medium"
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          <>
            <FileText className="w-5 h-5 mr-2" />
            Upload & Share
          </>
        )}
      </Button>
    </div>
  );
};
import React, { useState, useCallback, useEffect, ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Code as CodeIcon, Lock, FileCode } from 'lucide-react';
import { CodeDisplay } from '@/components/CodeDisplay';
import { apiService } from '@/services/apiService';
import MonacoEditor from '@monaco-editor/react';

// Available programming languages for the code editor
const CODE_EDITOR_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];

export const Share = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<'image' | 'pdf' | 'text' | 'other'>('other');
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [code, setCode] = useState('// Enter your code here\n// Select a language from the dropdown');
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('script.js');
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
    let contentToShare = text;
    let fileToShare = file;

    // If in code editor mode, create a file with the code
    if (activeTab === 'code' && !file) {
      const blob = new Blob([code], { type: 'text/plain' });
      fileToShare = new File([blob], fileName || 'script.js', { type: 'text/plain' });
      contentToShare = ''; // Clear text content when sharing code
    }

    if (!fileToShare && !contentToShare.trim() && !code.trim()) {
      toast({
        title: "Nothing to share",
        description: "Please upload a file, enter some text, or write some code",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const shareCode = generateCode();
      
      // Prepare the share data
      const shareData: any = { 
        text: contentToShare,
        password: isPasswordProtected ? password : undefined,
        metadata: {}
      };

      // Add code editor metadata if in code mode
      if (activeTab === 'code' && !fileToShare) {
        shareData.metadata = {
          isCode: true,
          language: language,
          fileName: fileName
        };
      }

      // Handle file upload if there's a file
      if (fileToShare) {
        const res = await apiService.createShare({
          text: shareData.text,
          file: fileToShare,
          password: shareData.password,
          metadata: shareData.metadata,
        });
        setGeneratedCode(res.code);
      } else {
        // Text/code only share
        const res = await apiService.createShare({
          text: shareData.text,
          password: shareData.password,
          metadata: shareData.metadata,
        });
        setGeneratedCode(res.code);
      }
      
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
        <p className="text-muted-foreground">Upload a file, enter text, or write code to generate a shareable link</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" disabled={!!file}>
            <FileText className="w-4 h-4 mr-2" /> Text
          </TabsTrigger>
          <TabsTrigger value="code" disabled={!!file}>
            <CodeIcon className="w-4 h-4 mr-2" /> Code
          </TabsTrigger>
          <TabsTrigger value="file" onClick={() => setActiveTab('file')}>
            <FileCode className="w-4 h-4 mr-2" /> File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            className="min-h-[200px] font-mono text-sm"
            disabled={!!file}
          />
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filename">File Name</Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="script.js"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CODE_EDITOR_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden h-[300px] bg-gray-100 dark:bg-gray-800">
            <MonacoEditor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                readOnly: false,
                folding: true,
                lineNumbersMinChars: 3,
                contextmenu: true,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto'
                }
              }}
              loading={
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Loading editor...
                </div>
              }
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="password-protect"
              checked={isPasswordProtected}
              onChange={(e) => setIsPasswordProtected(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="password-protect" className="flex items-center">
              <Lock className="w-4 h-4 mr-2" /> Password Protect
            </Label>
          </div>
          {isPasswordProtected && (
            <Input
              type="password"
              placeholder="Enter a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleShare}
          disabled={isGenerating || (!file && !text.trim() && !code.trim())}
        >
          {isGenerating ? 'Generating...' : 'Generate Share Link'}
        </Button>
      </div>
    </div>
  );
};
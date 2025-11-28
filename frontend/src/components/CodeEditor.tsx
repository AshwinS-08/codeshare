import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, FileCode, Palette } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    theme?: 'light' | 'dark';
}

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
];

const THEMES = [
    { value: 'github', label: '🌟 GitHub' },
    { value: 'monokai', label: '🌙 Monokai' },
    { value: 'dracula', label: '🧛 Dracula' },
    { value: 'nord', label: '❄️ Nord' },
    { value: 'synthwave', label: '🌆 Synthwave' },
];

export function CodeEditor({ value, onChange, theme = 'dark' }: CodeEditorProps) {
    const [language, setLanguage] = useState('javascript');
    const [editorTheme, setEditorTheme] = useState('github');
    const [showPreview, setShowPreview] = useState(false);

    return (
        <Card className="overflow-hidden border-primary/20">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Code Editor</span>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <FileCode className="w-3 h-3 mr-1" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={editorTheme} onValueChange={setEditorTheme}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <Palette className="w-3 h-3 mr-1" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {THEMES.map((t) => (
                                <SelectItem key={t.value} value={t.value} className="text-xs">
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        size="sm"
                        variant={showPreview ? 'default' : 'outline'}
                        onClick={() => setShowPreview(!showPreview)}
                        className="h-8 text-xs"
                    >
                        {showPreview ? 'Edit' : 'Preview'}
                    </Button>
                </div>
            </div>

            {/* Editor/Preview Area */}
            <div className="relative">
                {showPreview ? (
                    <div className="max-h-[500px] overflow-auto">
                        <SyntaxHighlighter
                            language={language}
                            style={theme === 'dark' ? vscDarkPlus : vs}
                            customStyle={{
                                margin: 0,
                                borderRadius: 0,
                                fontSize: '14px',
                                lineHeight: '1.6',
                            }}
                            showLineNumbers
                            wrapLines
                        >
                            {value || '// Your code here...'}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Paste your code here..."
                        className="min-h-[400px] font-mono text-sm border-0 rounded-none focus-visible:ring-0 resize-none"
                        spellCheck={false}
                    />
                )}
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span>Lines: {value.split('\n').length}</span>
                    <span>Characters: {value.length}</span>
                    <span>Language: {LANGUAGES.find((l) => l.value === language)?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-primary">●</span>
                    <span>Auto-save enabled</span>
                </div>
            </div>
        </Card>
    );
}

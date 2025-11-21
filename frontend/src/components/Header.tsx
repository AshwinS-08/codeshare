import { Moon, Sun, Code, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent shadow-md">
            <Code className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg md:text-xl font-semibold md:font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            CodeShare
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="/how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </a>
          <a
            href="https://github.com/lovable-dev/project-api"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container px-4 py-3 flex flex-col gap-3">
            <a 
              href="/" 
              className="py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="https://github.com/lovable-dev/project-api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              GitHub
            </a>
            <a 
              href="https://docs.codeshare.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="py-2 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documentation
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
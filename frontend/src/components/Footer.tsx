import { Code, Github, FileText, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-r from-background to-secondary/20 backdrop-blur">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent shadow-md">
                <Code className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CodeShare
              </span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Share files and text instantly with unique codes. Upload once, access anywhere with a simple code.
              All content automatically expires after 24 hours for your privacy and security.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex flex-col gap-3">
              <a href="https://github.com/lovable-dev/project-api" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a href="https://twitter.com/lovable_dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </a>
              <a href="mailto:contact@codeshare.dev" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <div className="flex flex-col gap-3">
              {/* Add links to legal pages if you have them */}
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} CodeShare. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Made with ❤️ by <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Codeshare</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

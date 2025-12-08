import { Moon, Sun, Code, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserEmail(session.user.email ?? null);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setUserEmail(newSession?.user.email ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setAuthLoading(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (session) {
      toast({ title: "Logged in", description: "Welcome back!" });
      setLoginOpen(false);
      setLoginPassword("");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });
    setAuthLoading(false);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account created",
      description: "You can now log in with your credentials.",
    });
    setSignupOpen(false);
    setSignupPassword("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent shadow-md">
              <Code className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg md:text-xl font-semibold md:font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
              CodeShare
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link to="/how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link to="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link to="/api-docs" className="transition-colors hover:text-foreground font-semibold text-primary">
            API Docs 🚀
          </Link>
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
          {/* Auth controls (desktop) */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            {userEmail ? (
              <>
                <span className="text-sm text-muted-foreground max-w-[160px] truncate">
                  {userEmail}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard">Dashboard</a>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Login</DialogTitle>
                      <DialogDescription>
                        Sign in to save your activity to your account.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleLogin}>
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? "Please wait..." : "Login"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">Sign up</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create account</DialogTitle>
                      <DialogDescription>
                        Create a new account to keep your content linked to you.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSignup}>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? "Creating..." : "Sign up"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>

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
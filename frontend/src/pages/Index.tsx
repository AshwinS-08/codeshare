import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Share } from '@/components/Share';
import { Retrieve } from '@/components/Retrieve';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { FileCode, Share2, Download, Zap, Lock, Clock } from 'lucide-react';
import { UserStats } from '@/components/UserStats';
import { UserShares } from '@/components/UserShares';
const Index = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="relative flex flex-col gap-10 md:gap-14 lg:gap-16 md:flex-row md:items-center max-w-6xl mx-auto mb-16 animate-fade-in">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-56 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-3xl" />

          {/* Left: Text + CTAs */}
          <div className="flex-1 space-y-5 md:space-y-6">
            <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-xs md:text-sm font-medium text-muted-foreground border border-border/60 backdrop-blur-sm">
              Share code & files in seconds
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
              Share securely.
              <br className="hidden sm:block" />
              Access instantly.
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Generate a secure code, share it with your team, and access files or snippets from any device—without logins or setup.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <a
                href="#share"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm md:text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start sharing for free
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-border/70 bg-background/50 px-5 py-2 text-sm md:text-base font-medium text-foreground/80 hover:bg-muted/60 transition-colors"
              >
                See how it works
              </a>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              No signup required • End-to-end encrypted • Auto-expires in 24 hours
            </p>
          </div>

          {/* Right: Visual preview */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm md:max-w-md">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-primary/30 via-accent/20 to-secondary/30 blur-2xl opacity-60" />
              <div className="relative rounded-3xl border border-border/70 bg-card/90 shadow-xl shadow-black/5 backdrop-blur-sm p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-8 w-28 rounded-full bg-muted/70" />
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/60 border border-border/70 p-3 space-y-2 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-background/80 font-semibold text-foreground/80">code-share.ts</span>
                    <span className="text-[10px] text-muted-foreground">expires in 24h</span>
                  </div>
                  <div className="h-20 rounded-lg bg-background/80 border border-dashed border-border/70" />
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-28 rounded-full bg-primary/10 border border-primary/30 text-[11px] flex items-center justify-center text-primary font-medium">
                      CODE-9X3F
                    </div>
                    <span className="text-[11px] text-muted-foreground">Share this code</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">One-time access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section (below hero) */}
        <div
          id="features"
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-2 md:mt-0 mb-16 md:mb-20"
        >
          {[
            {
              icon: <Share2 className="w-8 h-8 text-primary" />,
              title: "Easy Sharing",
              description: "Upload files or paste text, get a unique code instantly.",
              gradient: "from-primary to-primary/80"
            },
            {
              icon: <Download className="w-8 h-8 text-secondary" />,
              title: "Quick Access",
              description: "Enter a code on any device to retrieve shared content.",
              gradient: "from-secondary to-secondary/80"
            },
            {
              icon: <Lock className="w-8 h-8 text-accent" />,
              title: "Secure & Private",
              description: "End-to-end encryption and auto-expiring content.",
              gradient: "from-accent to-accent/80"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-${feature.gradient.split(' ')[0]}/10 flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 -z-10`}></div>
            </div>
          ))}
        </div>

        {/* Main Interface */}
        <Card id="share" className="max-w-4xl mx-auto shadow-xl border border-border/50 overflow-hidden">
          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-muted/50 h-14">
              <TabsTrigger
                value="share"
                className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Content
              </TabsTrigger>
              <TabsTrigger
                value="retrieve"
                className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Get Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="p-6 md:p-8">
              <div className="animate-slide-up">
                <Share />
              </div>
            </TabsContent>

            <TabsContent value="retrieve" className="p-6 md:p-8">
              <div className="animate-slide-up">
                <Retrieve />
              </div>
            </TabsContent>
          </Tabs>

          <div className="px-6 py-4 border-t bg-muted/20 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Files are automatically deleted after 24 hours</span>
            </div>
          </div>
        </Card>



        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            No account required • End-to-end encrypted
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share anything quickly and securely. Our platform uses modern encryption to keep your files safe during transfer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
import { Share2, Download, Lock, Clock, Code2, FileText, Eye, Shield, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Share2 className="w-6 h-6 text-violet-600" />,
    title: "Easy Sharing",
    description: "Upload files or paste text and get a shareable link instantly. No signup required.",
    cta: "Start sharing now",
    link: "/#share"
  },
  {
    icon: <Download className="w-6 h-6 text-blue-600" />,
    title: "Quick Access",
    description: "Access your shared content from any device with just a simple code.",
    cta: "Try it out",
    link: "/#share"
  },
  {
    icon: <Lock className="w-6 h-6 text-green-600" />,
    title: "Secure & Private",
    description: "End-to-end encrypted transfers and auto-expiring content for maximum privacy.",
    cta: "Learn more",
    link: "/how-it-works"
  },
  {
    icon: <Clock className="w-6 h-6 text-amber-600" />,
    title: "Auto-Expiration",
    description: "All shares automatically expire after 24 hours to keep your data secure.",
    cta: "How it works",
    link: "/how-it-works"
  },
  {
    icon: <Code2 className="w-6 h-6 text-pink-600" />,
    title: "Code Snippets",
    description: "Share code with syntax highlighting for better readability.",
    cta: "Share code",
    link: "/#share"
  },
  {
    icon: <FileText className="w-6 h-6 text-indigo-600" />,
    title: "File Sharing",
    description: "Upload and share any file type with size limits and preview support.",
    cta: "Upload files",
    link: "/#share"
  },
  {
    icon: <Eye className="w-6 h-6 text-cyan-600" />,
    title: "View Analytics",
    description: "Track how many times your shares have been viewed.",
    cta: "View dashboard",
    link: "/dashboard"
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-600" />,
    title: "Password Protection",
    description: "Add an extra layer of security with password protection.",
    cta: "Secure your shares",
    link: "/#share"
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-600" />,
    title: "Lightning Fast",
    description: "Built with modern technologies for the fastest sharing experience.",
    cta: "Try it now",
    link: "/#share"
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Powerful Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to share files and code snippets quickly and securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <div className="mb-4 p-3 w-12 h-12 rounded-xl bg-opacity-10 flex items-center justify-center" style={{ backgroundColor: `${feature.icon.props.className.split(' ').find(c => c.startsWith('text-')).replace('text-', '')}20` }}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4 flex-grow">{feature.description}</p>
              <Button asChild variant="outline" className="w-full mt-auto">
                <Link to={feature.link}>
                  {feature.cta} →
                </Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust CodeShare for their file and code sharing needs.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <Link to="/#share">
              Start Sharing for Free
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Features;

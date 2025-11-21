import { Card } from "@/components/ui/card";
import { Share2, Download, Lock } from "lucide-react";

const steps = [
  {
    icon: Share2,
    title: "Create a share",
    description:
      "Upload a file or paste text. We generate a unique, short code for your content.",
  },
  {
    icon: Download,
    title: "Share the code",
    description:
      "Send the code to anyone you trust. They can view or download from any device.",
  },
  {
    icon: Lock,
    title: "Auto-expire securely",
    description:
      "Your share automatically expires after 24 hours to keep things lightweight and safe.",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-4xl">
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            How CodeShare works
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple three-step flow: create a share, send the code, and let CodeShare handle secure, time-limited access.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="relative flex gap-4 md:gap-6 items-start p-5 md:p-6 rounded-2xl border border-border/70 bg-card/90 shadow-sm"
            >
              <div className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  STEP {index + 1}
                </p>
                <h2 className="text-lg md:text-xl font-semibold text-foreground">
                  {step.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 md:mt-16 text-center text-sm md:text-base text-muted-foreground">
          <p>
            Ready to try it? Go back to the home page and create your first share in under 30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

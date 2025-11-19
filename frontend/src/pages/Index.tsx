import { Share } from '@/components/Share';
import { Retrieve } from '@/components/Retrieve';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { FileCode, Share2, Download } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
      
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Share files and text instantly with unique codes. Upload once, access anywhere with a simple code.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-lg border border-white/10 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Share2 className="w-9 h-9 text-primary" />
              </div>
              <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Easy Sharing</h3>
              <p className="text-muted-foreground">Upload files or paste text, get a unique code instantly.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-lg border border-white/10 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Download className="w-9 h-9 text-accent" />
              </div>
              <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-accent to-destructive bg-clip-text text-transparent">Quick Access</h3>
              <p className="text-muted-foreground">Enter a code on any device to retrieve shared content.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-lg border border-white/10 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
                <FileCode className="w-9 h-9 text-destructive" />
              </div>
              <h3 className="font-bold text-2xl mb-3 bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">Auto-Expire</h3>
              <p className="text-muted-foreground">Content expires after 24 hours for your security.</p>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <Card className="max-w-4xl mx-auto shadow-lg backdrop-blur-sm bg-card/80">
          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="share" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Content
              </TabsTrigger>
              <TabsTrigger value="retrieve" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Get Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="share" className="p-6 md:p-8">
              <Share />
            </TabsContent>
            
            <TabsContent value="retrieve" className="p-6 md:p-8">
              <Retrieve />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
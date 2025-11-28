import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserStats } from "@/components/UserStats";
import { UserShares } from "@/components/UserShares";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutDashboard, Settings, LogOut, BarChart3, Activity, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const { toast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/");
                return;
            }
            setUserEmail(session.user.email || "User");
            setLoading(false);
        };
        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast({ title: "Logged out" });
        navigate("/");
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark');
        toast({
            title: `${newTheme === 'dark' ? '🌙' : '☀️'} Theme changed`,
            description: `Switched to ${newTheme} mode`
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-pink-600 to-amber-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-left-4 duration-700">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg animate-in fade-in slide-in-from-left-4 duration-700 delay-75">
                            Welcome back, <span className="font-medium text-foreground">{userEmail}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
                        <NotificationCenter />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleTheme}
                            className="transition-transform hover:scale-110"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </Button>
                        <Button
                            onClick={() => navigate("/#share")}
                            className="shadow-lg shadow-primary/20 transition-all hover:scale-105 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Share
                        </Button>
                        <Button variant="outline" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </Button>
                    </div>
                </div>

                {/* Tabbed Interface */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50 p-1">
                        <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                            <Activity className="w-4 h-4" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-8 lg:grid-cols-12">
                            {/* Left Sidebar / Stats Column */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-card rounded-xl border shadow-sm p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-2 mb-6 text-primary">
                                        <LayoutDashboard className="w-5 h-5" />
                                        <h2 className="font-semibold text-lg">Quick Stats</h2>
                                    </div>
                                    <UserStats />
                                </div>

                                <div className="bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-amber-500/10 rounded-xl border border-violet-500/20 p-6 hover:shadow-lg hover:shadow-violet-500/10 transition-all">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <span className="text-2xl">💡</span>
                                        Pro Tip
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Files shared while logged in are linked to your account, allowing you to track views and manage them later.
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-6 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <span className="text-2xl">🚀</span>
                                        New Features
                                    </h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• QR Code generation</li>
                                        <li>• Password protection</li>
                                        <li>• Advanced analytics</li>
                                        <li>• Real-time notifications</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Main Column / Shares List */}
                            <div className="lg:col-span-8">
                                <div className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-6 border-b bg-gradient-to-r from-violet-500/5 to-pink-500/5">
                                        <h2 className="font-semibold text-lg">Recent Uploads</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Manage and track your shared content
                                        </p>
                                    </div>
                                    <div className="p-0">
                                        <UserShares />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AnalyticsChart />
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-card rounded-xl border shadow-sm p-8 text-center">
                            <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">Activity Feed</h3>
                            <p className="text-muted-foreground mb-6">
                                Track all your share activities in real-time
                            </p>
                            <div className="space-y-4 max-w-2xl mx-auto">
                                {[
                                    { action: 'Created share', item: 'project-code.js', time: '2 minutes ago', icon: '📤' },
                                    { action: 'Share viewed', item: 'design-mockup.png', time: '15 minutes ago', icon: '👁️' },
                                    { action: 'File downloaded', item: 'api-docs.md', time: '1 hour ago', icon: '⬇️' },
                                    { action: 'QR code generated', item: 'presentation.pdf', time: '3 hours ago', icon: '📱' },
                                ].map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                        <span className="text-2xl">{activity.icon}</span>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{activity.action}</p>
                                            <p className="text-sm text-muted-foreground">{activity.item}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

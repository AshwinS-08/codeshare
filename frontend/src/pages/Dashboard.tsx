import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserStats } from "@/components/UserStats";
import { UserShares } from "@/components/UserShares";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Welcome back, <span className="font-medium text-foreground">{userEmail}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => navigate("/#share")} className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
                            <Plus className="w-4 h-4 mr-2" />
                            New Share
                        </Button>
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Sidebar / Stats Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card rounded-xl border shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <LayoutDashboard className="w-5 h-5" />
                                <h2 className="font-semibold text-lg">Overview</h2>
                            </div>
                            <UserStats />
                        </div>

                        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10 p-6">
                            <h3 className="font-semibold mb-2">Pro Tip</h3>
                            <p className="text-sm text-muted-foreground">
                                Files shared while logged in are linked to your account, allowing you to track views and manage them later.
                            </p>
                        </div>
                    </div>

                    {/* Right Main Column / Shares List */}
                    <div className="lg:col-span-8">
                        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                            <div className="p-6 border-b bg-muted/5">
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
            </div>
        </div>
    );
}

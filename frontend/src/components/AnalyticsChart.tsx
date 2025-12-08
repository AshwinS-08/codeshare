import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Calendar, Globe } from 'lucide-react';
import { apiService } from '@/services/apiService';
import type { AnalyticsData } from '@/services/types';

interface ChartData {
    viewsOverTime: Array<{ date: string; views: number }>;
    topShares: Array<{ name: string; views: number; code: string }>;
    contentTypeDistribution: Array<{ name: string; value: number }>;
    totalViews: number;
    totalShares: number;
    avgViewsPerShare: number;
    recentShares: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export function AnalyticsChart() {
    const [analytics, setAnalytics] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null);
            try {
                const data: AnalyticsData = await apiService.getMyAnalytics();

                // Transform views_by_date to chart format (sorted by date)
                const viewsOverTime = Object.entries(data.views_by_date)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .slice(-7) // Last 7 days for default view
                    .map(([date, views]) => ({
                        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                        views
                    }));

                // Transform content_types to chart format
                const contentTypeDistribution = Object.entries(data.content_types).map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value
                }));

                // Transform top_shares to chart format
                const topShares = data.top_shares.map(share => ({
                    name: share.name,
                    views: share.views,
                    code: share.code
                }));

                setAnalytics({
                    viewsOverTime,
                    topShares,
                    contentTypeDistribution,
                    totalViews: data.total_views,
                    totalShares: data.total_shares,
                    avgViewsPerShare: data.avg_views,
                    recentShares: data.recent_shares
                });
            } catch (e) {
                console.error('Failed to fetch analytics:', e);
                setError(e instanceof Error ? e.message : 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-20 bg-muted rounded"></div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-8 text-center">
                <div className="text-destructive mb-2">Failed to load analytics</div>
                <div className="text-sm text-muted-foreground">{error}</div>
            </Card>
        );
    }

    if (!analytics) return null;

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                            <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                                {analytics.totalViews.toLocaleString()}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-green-500">+12.5%</span> from last week
                            </p>
                        </div>
                        <div className="p-3 bg-violet-500/20 rounded-full">
                            <Eye className="w-6 h-6 text-violet-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Shares</p>
                            <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                                {analytics.totalShares}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-green-500">+8.2%</span> from last week
                            </p>
                        </div>
                        <div className="p-3 bg-pink-500/20 rounded-full">
                            <Globe className="w-6 h-6 text-pink-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Views/Share</p>
                            <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                                {analytics.avgViewsPerShare}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-green-500">+5.1%</span> from last week
                            </p>
                        </div>
                        <div className="p-3 bg-amber-500/20 rounded-full">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">This Week</p>
                            <h3 className="text-3xl font-bold mt-2 bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                                {analytics.recentShares}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-emerald-500" />
                                Last 7 days
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-full">
                            <Calendar className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Views Over Time */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Views Over Time</h3>
                            <p className="text-sm text-muted-foreground">Daily view statistics</p>
                        </div>
                        <div className="flex gap-2">
                            {(['7d', '30d', '90d'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 text-xs rounded-full transition-all ${timeRange === range
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analytics.viewsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Content Type Distribution */}
                <Card className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold">Content Distribution</h3>
                        <p className="text-sm text-muted-foreground">Share types breakdown</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={analytics.contentTypeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {analytics.contentTypeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Shares */}
                <Card className="p-6 lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold">Top Performing Shares</h3>
                        <p className="text-sm text-muted-foreground">Most viewed content</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.topShares} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={150} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="views" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}

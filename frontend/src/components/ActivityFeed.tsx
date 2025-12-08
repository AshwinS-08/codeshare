import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { apiService } from '@/services/apiService';
import type { ActivityItem } from '@/services/types';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiService.getMyActivity();
                setActivities(data.activities);
            } catch (e) {
                console.error('Failed to fetch activity:', e);
                setError(e instanceof Error ? e.message : 'Failed to load activity');
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (loading) {
        return (
            <div className="bg-card rounded-xl border shadow-sm p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-8 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-destructive opacity-50" />
                <div className="text-destructive mb-2">Failed to load activity</div>
                <div className="text-sm text-muted-foreground">{error}</div>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="bg-card rounded-xl border shadow-sm p-8 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground mb-6">
                    Create your first share to see activity here
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border shadow-sm p-8">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Recent Activity</h3>
            </div>
            <p className="text-muted-foreground mb-6">
                Track all your share activities in real-time
            </p>
            <div className="space-y-4 max-w-3xl mx-auto">
                {activities.map((activity, i) => {
                    // Format timestamp as relative time
                    const relativeTime = activity.timestamp
                        ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
                        : 'recently';

                    return (
                        <div
                            key={`${activity.code}-${activity.type}-${i}`}
                            className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <span className="text-2xl">{activity.icon}</span>
                            <div className="flex-1 text-left">
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.item}
                                    {activity.code && (
                                        <span className="ml-2 font-mono text-xs bg-muted px-2 py-0.5 rounded">
                                            {activity.code}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground">{relativeTime}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

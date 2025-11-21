import { useEffect, useState } from "react";
import { apiService } from "@/services/apiService";
import { Card } from "@/components/ui/card";

export const UserStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalShares, setTotalShares] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiService.getMyStats();
        if (cancelled) return;
        setTotalShares(data.total_shares || 0);
        setTotalViews(data.total_views || 0);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        Loading your stats...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 text-sm text-destructive">
        {error}
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col gap-2 text-sm">
      <div className="font-medium text-base">Your stats</div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Total shares</span>
        <span className="font-semibold">{totalShares}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Total views</span>
        <span className="font-semibold">{totalViews}</span>
      </div>
    </Card>
  );
};

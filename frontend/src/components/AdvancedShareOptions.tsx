import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Clock, Eye, Shield } from 'lucide-react';

interface AdvancedShareOptionsProps {
    onOptionsChange: (options: ShareOptions) => void;
}

export interface ShareOptions {
    password?: string;
    expiryTime?: string;
    maxViews?: number;
    oneTimeView: boolean;
    requireAuth: boolean;
}

export function AdvancedShareOptions({ onOptionsChange }: AdvancedShareOptionsProps) {
    const [options, setOptions] = useState<ShareOptions>({
        oneTimeView: false,
        requireAuth: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const updateOptions = (newOptions: Partial<ShareOptions>) => {
        const updated = { ...options, ...newOptions };
        setOptions(updated);
        onOptionsChange(updated);
    };

    return (
        <Card className="p-6 space-y-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Advanced Options</h3>
            </div>

            {/* Password Protection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <Label htmlFor="password-toggle" className="cursor-pointer">
                            Password Protection
                        </Label>
                    </div>
                    <Switch
                        id="password-toggle"
                        checked={showPassword}
                        onCheckedChange={setShowPassword}
                    />
                </div>
                {showPassword && (
                    <div className="pl-6 animate-in slide-in-from-top-2 duration-200">
                        <Input
                            type="password"
                            placeholder="Enter password"
                            value={options.password || ''}
                            onChange={(e) => updateOptions({ password: e.target.value })}
                            className="bg-background/50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Recipients will need this password to view the share
                        </p>
                    </div>
                )}
            </div>

            {/* Expiry Time */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="expiry">Expiry Time</Label>
                </div>
                <Select
                    value={options.expiryTime || 'never'}
                    onValueChange={(value) =>
                        updateOptions({ expiryTime: value === 'never' ? undefined : value })
                    }
                >
                    <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select expiry time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="never">Never expires</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Max Views */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="max-views">Maximum Views</Label>
                </div>
                <Input
                    id="max-views"
                    type="number"
                    placeholder="Unlimited"
                    min="1"
                    value={options.maxViews || ''}
                    onChange={(e) =>
                        updateOptions({
                            maxViews: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                    }
                    className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                    Share will be disabled after this many views
                </p>
            </div>

            {/* One-Time View */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border">
                <div className="space-y-0.5">
                    <div className="font-medium">One-Time View</div>
                    <div className="text-sm text-muted-foreground">
                        Share self-destructs after first view
                    </div>
                </div>
                <Switch
                    checked={options.oneTimeView}
                    onCheckedChange={(checked) => updateOptions({ oneTimeView: checked })}
                />
            </div>

            {/* Require Authentication */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border">
                <div className="space-y-0.5">
                    <div className="font-medium">Require Authentication</div>
                    <div className="text-sm text-muted-foreground">
                        Only logged-in users can view
                    </div>
                </div>
                <Switch
                    checked={options.requireAuth}
                    onCheckedChange={(checked) => updateOptions({ requireAuth: checked })}
                />
            </div>

            {/* Summary */}
            {(options.password || options.expiryTime || options.maxViews || options.oneTimeView || options.requireAuth) && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                    <p className="text-sm font-medium text-primary">Active Protections:</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                        {options.password && <li>🔒 Password protected</li>}
                        {options.expiryTime && <li>⏰ Expires in {options.expiryTime}</li>}
                        {options.maxViews && <li>👁️ Limited to {options.maxViews} views</li>}
                        {options.oneTimeView && <li>💥 Self-destructs after first view</li>}
                        {options.requireAuth && <li>🔐 Authentication required</li>}
                    </ul>
                </div>
            )}
        </Card>
    );
}

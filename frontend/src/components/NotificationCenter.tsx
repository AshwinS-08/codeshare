import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Eye, Upload, Download, Link as LinkIcon, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'view' | 'upload' | 'download' | 'share';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    shareCode?: string;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Mock notifications - will be replaced with real-time updates
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'view',
                title: 'New View',
                message: 'Your share "project-code.js" was viewed',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                read: false,
                shareCode: 'ABC123',
            },
            {
                id: '2',
                type: 'download',
                title: 'File Downloaded',
                message: 'Someone downloaded "design-mockup.png"',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                read: false,
                shareCode: 'XYZ789',
            },
            {
                id: '3',
                type: 'upload',
                title: 'Upload Complete',
                message: 'Your file "api-docs.md" was uploaded successfully',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: true,
                shareCode: 'DEF456',
            },
            {
                id: '4',
                type: 'share',
                title: 'Share Created',
                message: 'New share link created and copied to clipboard',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                read: true,
            },
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        const notification = notifications.find((n) => n.id === id);
        if (notification && !notification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'view':
                return <Eye className="w-4 h-4 text-blue-500" />;
            case 'upload':
                return <Upload className="w-4 h-4 text-green-500" />;
            case 'download':
                return <Download className="w-4 h-4 text-purple-500" />;
            case 'share':
                return <LinkIcon className="w-4 h-4 text-pink-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                        {unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Notification Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <Card className="absolute right-0 top-12 w-96 max-h-[600px] overflow-hidden z-50 shadow-2xl border-primary/20 animate-in slide-in-from-top-4 duration-200">
                        {/* Header */}
                        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Notifications</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-auto p-0 text-xs text-primary"
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[500px]">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group ${!notification.read ? 'bg-primary/5' : ''
                                                }`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1">{getIcon(notification.type)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {notification.message}
                                                            </p>
                                                            {notification.shareCode && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="mt-2 text-xs"
                                                                >
                                                                    {notification.shareCode}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notification.id);
                                                            }}
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {formatDistanceToNow(notification.timestamp, {
                                                            addSuffix: true,
                                                        })}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t bg-muted/30 text-center">
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-xs text-primary"
                                >
                                    View all activity
                                </Button>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}

import React, { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, ShieldCheck } from 'lucide-react';

export default function AdminNotificationBell() {
    const { auth, adminNotifications } = usePage().props;
    const userId = auth?.user?.id;

    const [items, setItems] = useState(adminNotifications?.items || []);
    const [unreadCount, setUnreadCount] = useState(adminNotifications?.unread_count || 0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setItems(adminNotifications?.items || []);
        setUnreadCount(adminNotifications?.unread_count || 0);
    }, [adminNotifications]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!userId || !window.Echo) return;

        const channelName = `App.Models.User.${userId}`;
        const channel = window.Echo.private(channelName);

        channel.notification((notification) => {
            const formatted = {
                id: notification.id,
                data: notification,
                read_at: null,
                created_at: 'Just now',
            };

            setItems((prev) => [formatted, ...prev].slice(0, 15));
            setUnreadCount((prev) => prev + 1);
            toast.success(notification.message || notification.title || 'New notification');
        });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [userId]);

    const handleNotificationClick = (item) => {
        setOpen(false);
        const targetUrl = item.data?.url || '/admin/review-retailer';

        if (!item.read_at) {
            router.post(`/admin/notifications/${item.id}/read`, {}, {
                preserveScroll: true,
                onSuccess: () => router.visit(targetUrl),
            });
        } else {
            router.visit(targetUrl);
        }
    };

    const handleMarkAllRead = () => {
        router.post('/admin/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative p-2 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-purple-700 transition cursor-pointer"
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none shadow-2xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                        </span>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                                No notifications yet.
                            </div>
                        ) : (
                            items.map((item) => {
                                const isUnread = !item.read_at;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleNotificationClick(item)}
                                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer ${
                                            isUnread ? 'bg-purple-50/40' : 'bg-white'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {item.data?.title || 'Notification'}
                                                </p>
                                                {isUnread && (
                                                    <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                                {item.data?.message}
                                            </p>
                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                {item.created_at}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


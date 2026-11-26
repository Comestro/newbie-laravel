import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function PanelSidebar({
    brandHref = '/',
    badge = '',
    badgeClassName = 'text-slate-400',
    links = [],
    rootPath = '/',
    accent = 'purple',
    headerExtra = null,
}) {
    const { url } = usePage();

    const isActive = (path) => (path === rootPath ? url === rootPath : url.startsWith(path));

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const activeStyles =
        accent === 'emerald'
            ? { link: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-600' }
            : { link: 'bg-purple-50 text-purple-700', icon: 'text-purple-600' };

    return (
        <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shrink-0 h-full">
            {/* Brand */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
                <Link href={brandHref} className="flex items-center gap-2">
                    <img src="/logo.png" className="h-8 w-auto" alt={badge || 'Newbie'} />
                    {badge && (
                        <span className={`text-xs uppercase tracking-wider font-bold ${badgeClassName}`}>
                            {badge}
                        </span>
                    )}
                </Link>
            </div>

            {headerExtra}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                active
                                    ? activeStyles.link
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${active ? activeStyles.icon : 'text-slate-400'}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer: Back to Store & Logout */}
            <div className="border-t border-slate-100 p-3 space-y-1 shrink-0">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Store</span>
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition text-xs font-semibold cursor-pointer"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}


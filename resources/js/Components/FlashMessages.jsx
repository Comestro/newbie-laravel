import React from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function FlashMessages() {
    const { flash = {} } = usePage().props;

    if (!flash.success && !flash.error) return null;

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {flash.success && (
                <div className="pointer-events-auto flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-medium">{flash.success}</p>
                </div>
            )}
            {flash.error && (
                <div className="pointer-events-auto flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <p className="text-sm font-medium">{flash.error}</p>
                </div>
            )}
        </div>
    );
}

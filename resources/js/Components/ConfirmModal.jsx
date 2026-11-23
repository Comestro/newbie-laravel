import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, Info, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen = false,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'warning' | 'primary'
    loading = false,
    onConfirm,
    onClose,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose?.();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';
    const isWarning = variant === 'warning';

    const getIcon = () => {
        if (isDanger) return <Trash2 className="w-5 h-5" />;
        if (isWarning) return <AlertTriangle className="w-5 h-5" />;
        return <Info className="w-5 h-5" />;
    };

    const getIconClasses = () => {
        if (isDanger) return 'bg-rose-50 text-rose-600 border border-rose-100';
        if (isWarning) return 'bg-amber-50 text-amber-600 border border-amber-100';
        return 'bg-purple-50 text-purple-600 border border-purple-100';
    };

    const getConfirmButtonClasses = () => {
        if (isDanger) return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white';
        if (isWarning) return 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white';
        return 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                onClick={!loading ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal Dialog */}
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all border border-slate-100"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-modal-title"
                >
                    {/* Close 'X' Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconClasses()}`}>
                            {getIcon()}
                        </div>

                        {/* Title and Message */}
                        <div className="flex-1 pr-6">
                            <h3
                                id="confirm-modal-title"
                                className="text-base font-semibold text-slate-900 leading-snug"
                            >
                                {title}
                            </h3>
                            <div className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                {typeof message === 'string' ? <p>{message}</p> : message}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-60 ${getConfirmButtonClasses()}`}
                        >
                            {loading && (
                                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            <span>{confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


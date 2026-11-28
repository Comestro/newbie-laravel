import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Coins, Crown, History, X } from 'lucide-react';

export default function UserLoyaltyMembershipCard({ user, transactions = [] }) {
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const isMember = Boolean(user?.is_member);
    const points = Number(user?.loyalty_points || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>Membership &amp; Loyalty Points</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                isMember
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                            <Crown className="w-3 h-3" />
                            <span>{isMember ? 'Active Member' : 'Not a Member'}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(true)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition cursor-pointer"
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>History</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Membership Status
                        </span>
                        <p className={`font-bold mt-1 ${isMember ? 'text-emerald-700' : user?.membership_paid_at ? 'text-rose-600' : 'text-slate-700'}`}>
                            {isMember ? 'Active' : user?.membership_paid_at ? 'Expired' : 'Inactive'}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Last Paid On
                        </span>
                        <p className="font-semibold text-slate-800 mt-1">
                            {formatDate(user?.membership_paid_at) || '—'}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Valid Until
                        </span>
                        <p className="font-semibold text-slate-800 mt-1">
                            {formatDate(user?.membership_expires_at) || '—'}
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1">
                            <Coins className="w-3 h-3" /> Available Points
                        </span>
                        <p className="text-base font-extrabold text-purple-700 mt-0.5">
                            {points.toLocaleString()} pts
                        </p>
                    </div>
                </div>
            </div>

            {/* Right-Side Slide-Over Modal for Points History */}
            {showHistoryModal && createPortal(
                <div
                    className="fixed inset-0 z-50 !mt-0 flex justify-end bg-slate-900/40 backdrop-blur-[1px]"
                    onClick={() => setShowHistoryModal(false)}
                >
                    <div
                        className="w-full max-w-md bg-white h-screen shadow-2xl border-l border-slate-100 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <History className="w-4 h-4 text-purple-600" />
                                    <span>Points &amp; Membership History</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Available Balance:{' '}
                                    <span className="font-bold text-purple-700">{points.toLocaleString()} pts</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowHistoryModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {transactions.length === 0 ? (
                                <div className="text-center py-12 text-xs text-slate-400">
                                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="font-semibold text-slate-600">No loyalty activity yet</p>
                                    <p className="text-[11px] mt-0.5">Membership and points transactions will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {transactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-2xs flex items-start justify-between gap-3 text-xs"
                                        >
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                        {tx.type}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        {formatDate(tx.created_at)}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-slate-800 leading-snug">{tx.description}</p>
                                                {tx.amount && Number(tx.amount) > 0 && (
                                                    <p className="text-[11px] text-slate-500 font-mono">
                                                        Amount: ₹{Number(tx.amount).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                            <span
                                                className={`font-bold whitespace-nowrap shrink-0 ${
                                                    tx.points > 0
                                                        ? 'text-emerald-600'
                                                        : tx.points < 0
                                                        ? 'text-rose-600'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

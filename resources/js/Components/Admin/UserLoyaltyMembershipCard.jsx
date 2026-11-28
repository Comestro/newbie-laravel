import React from 'react';
import { Coins, Crown, History } from 'lucide-react';

export default function UserLoyaltyMembershipCard({ user, transactions = [] }) {
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
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Membership &amp; Loyalty Points</span>
                </h2>
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

            <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recent Loyalty &amp; Membership Activity ({transactions.length})</span>
                </h3>

                {transactions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center bg-slate-50/60 rounded-xl border border-slate-100">
                        No loyalty or membership transactions yet.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="py-2.5 px-3">Date</th>
                                    <th className="py-2.5 px-3">Type</th>
                                    <th className="py-2.5 px-3">Description</th>
                                    <th className="py-2.5 px-3 text-right">Amount</th>
                                    <th className="py-2.5 px-3 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50">
                                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                                            {formatDate(tx.created_at)}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-700">{tx.description}</td>
                                        <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                                            {tx.amount ? `₹${Number(tx.amount).toFixed(2)}` : '—'}
                                        </td>
                                        <td
                                            className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                                                tx.points > 0
                                                    ? 'text-emerald-600'
                                                    : tx.points < 0
                                                    ? 'text-rose-600'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}


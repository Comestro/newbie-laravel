import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function TwoFactorChallenge() {
    const [recovery, setRecovery] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/two-factor-challenge');
    };

    return (
        <GuestLayout
            title="Two-Factor Authentication"
            description={
                recovery
                    ? 'Please confirm access using one of your emergency recovery codes.'
                    : 'Please confirm access using the authentication code from your authenticator app.'
            }
        >
            <Head title="Two-Factor Challenge - Newbie Service" />

            <form onSubmit={handleSubmit} className="space-y-4">
                {!recovery ? (
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">6-Digit Code</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="123456"
                                className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                autoFocus
                            />
                        </div>
                        {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code}</p>}
                    </div>
                ) : (
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recovery Code</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                value={data.recovery_code}
                                onChange={(e) => setData('recovery_code', e.target.value)}
                                placeholder="xxxx-xxxx-xxxx"
                                className="w-full text-center font-mono text-sm py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                                autoFocus
                            />
                        </div>
                        {errors.recovery_code && <p className="text-xs text-red-600 mt-1">{errors.recovery_code}</p>}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition text-sm"
                >
                    <KeyRound className="w-4 h-4" />
                    <span>Authenticate</span>
                </button>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setRecovery(!recovery);
                            setData({ code: '', recovery_code: '' });
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                        {recovery ? 'Use an authenticator code' : 'Use a recovery code'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}


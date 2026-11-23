import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import { MailCheck, RefreshCw, LogOut } from 'lucide-react';

export default function VerifyEmail() {
    const { post, processing } = useForm();

    const handleResend = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <GuestLayout title="Verify Email" description="Thanks for signing up! Please verify your email address to proceed.">
            <Head title="Verify Email - Newbie Service" />

            <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <MailCheck className="w-8 h-8" />
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                    Before getting started, please check your inbox for an email verification link.
                    If you didn't receive it, click below and we'll gladly send another.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleResend}
                        disabled={processing}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Resend Verification Email</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center justify-center gap-1.5"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}


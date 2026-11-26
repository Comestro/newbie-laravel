<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AdminNotificationController extends Controller
{
    public function markAsRead(string $id): RedirectResponse
    {
        $notification = Auth::user()->notifications()->where('id', $id)->first();
        $notification?->markAsRead();

        return back();
    }

    public function markAllAsRead(): RedirectResponse
    {
        Auth::user()->unreadNotifications->markAsRead();

        return back();
    }
}


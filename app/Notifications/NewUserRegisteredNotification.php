<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewUserRegisteredNotification extends Notification implements ShouldBroadcastNow
{
    public function __construct(
        public readonly User $user,
        public readonly ?string $shopName = null
    ) {}

    /**
     * Send this notification to all admins without failing the caller if broadcast is offline.
     */
    public static function notifyAdmins(User $user, ?string $shopName = null): void
    {
        User::notifyAdmins(new self($user, $shopName));
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $isRetailer = $this->user->isRetailer() || !empty($this->shopName);

        return [
            'type' => $isRetailer ? 'retailer_registered' : 'customer_registered',
            'title' => $isRetailer ? 'New Retailer Registered' : 'New Customer Registered',
            'message' => $isRetailer
                ? "{$this->user->name}" . ($this->shopName ? " ({$this->shopName})" : '') . ' registered as a retailer.'
                : "{$this->user->name} ({$this->user->email}) created a new account.",
            'user_id' => $this->user->id,
            'role' => $this->user->role?->value ?? $this->user->role,
            'shop_name' => $this->shopName,
            'url' => $isRetailer ? '/admin/review-retailer' : '/admin/customers',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}


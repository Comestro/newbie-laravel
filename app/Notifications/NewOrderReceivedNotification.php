<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewOrderReceivedNotification extends Notification implements ShouldBroadcastNow
{
    public function __construct(
        public readonly Order $order,
        public readonly User $customer
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $amount = number_format((float) $this->order->total_amount, 2);
        $roleLabel = $this->customer->isRetailer() ? 'Retailer' : 'Customer';

        return [
            'type' => 'new_order',
            'title' => "New Order #{$this->order->order_number}",
            'message' => "{$roleLabel} {$this->customer->name} placed order #{$this->order->order_number} (₹{$amount}).",
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'user_id' => $this->customer->id,
            'url' => "/admin/orders/{$this->order->id}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}


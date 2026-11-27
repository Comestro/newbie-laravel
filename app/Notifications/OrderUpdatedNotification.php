<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class OrderUpdatedNotification extends Notification implements ShouldBroadcastNow
{
    public function __construct(
        public readonly Order $order,
        public readonly string $event,
        public readonly ?string $previousValue = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $orderNumber = $this->order->order_number;

        [$title, $message] = match ($this->event) {
            'status_changed' => [
                "Order #{$orderNumber} " . Str::headline($this->order->status?->value ?? (string) $this->order->status),
                "Your order #{$orderNumber} status has been updated to " . Str::headline($this->order->status?->value ?? (string) $this->order->status) . '.',
            ],
            'payment_status_changed' => [
                "Payment Updated for #{$orderNumber}",
                "Payment status for order #{$orderNumber} is now " . Str::headline($this->order->payment_status?->value ?? (string) $this->order->payment_status) . '.',
            ],
            default => [
                "Order #{$orderNumber} Updated",
                "Admin updated details or items on your order #{$orderNumber}.",
            ],
        };

        return [
            'type' => "order_{$this->event}",
            'title' => $title,
            'message' => $message,
            'order_id' => $this->order->id,
            'order_number' => $orderNumber,
            'status' => $this->order->status?->value ?? $this->order->status,
            'payment_status' => $this->order->payment_status?->value ?? $this->order->payment_status,
            'url' => "/order-view/{$orderNumber}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}


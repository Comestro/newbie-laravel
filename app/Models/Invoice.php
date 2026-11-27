<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'issued_at' => 'datetime',
        'snapshot' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create or regenerate an immutable invoice snapshot from the current state of an order.
     */
    public static function generateFromOrder(Order $order): self
    {
        $order->loadMissing(['items', 'user.retailerProfile', 'address']);

        $issuedAt = now();
        $invoiceNumber = 'INV-' . $order->order_number;
        $loyaltyDiscount = max(0, (float) $order->discount - (float) ($order->coupon_discount ?? 0));
        $addr = is_array($order->address) ? $order->address : [];

        $snapshot = [
            'invoice_number' => $invoiceNumber,
            'issued_at' => $issuedAt->toIso8601String(),
            'order_number' => $order->order_number,
            'order_created_at' => $order->created_at?->toIso8601String(),
            'status' => $order->status?->value ?? (string) $order->status,
            'payment_method' => $order->payment_method?->value ?? (string) $order->payment_method,
            'payment_status' => $order->payment_status?->value ?? (string) $order->payment_status,
            'customer' => [
                'name' => $order->user?->name ?? 'Customer',
                'email' => $order->user?->email,
                'shop_name' => $order->user?->retailerProfile?->shop_name,
                'gst_number' => $order->user?->retailerProfile?->gst_number,
            ],
            'address' => [
                'line1' => $addr['line1'] ?? null,
                'line2' => $addr['line2'] ?? null,
                'city' => $addr['city'] ?? null,
                'state' => $addr['state'] ?? null,
                'pincode' => $addr['pincode'] ?? null,
                'phone' => $addr['phone'] ?? null,
            ],
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'variant_name' => $item->variant_name,
                'quantity' => (int) $item->quantity,
                'price' => (float) $item->price,
                'total' => (float) $item->total,
            ])->values()->all(),
            'totals' => [
                'subtotal' => (float) $order->subtotal,
                'coupon_code' => $order->coupon_code,
                'coupon_discount' => (float) ($order->coupon_discount ?? 0),
                'loyalty_discount' => $loyaltyDiscount,
                'delivery_fee' => (float) $order->delivery_fee,
                'total_amount' => (float) $order->total_amount,
            ],
        ];

        return static::updateOrCreate(
            ['order_id' => $order->id],
            [
                'user_id' => $order->user_id,
                'invoice_number' => $invoiceNumber,
                'snapshot' => $snapshot,
                'issued_at' => $issuedAt,
            ]
        );
    }
}

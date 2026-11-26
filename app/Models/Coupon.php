<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function isValidForAmount(float $subtotal): ?string
    {
        if (!$this->is_active) {
            return 'This coupon is currently inactive.';
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'This coupon has expired.';
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return 'This coupon usage limit has been reached.';
        }

        if ($subtotal < (float) $this->min_order_amount) {
            return 'Minimum order amount of ₹' . number_format((float) $this->min_order_amount, 2) . ' is required.';
        }

        return null;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if ($this->type === 'FIXED') {
            $discount = (float) $this->value;
        } else {
            $discount = ($subtotal * (float) $this->value) / 100;
            if ($this->max_discount_amount !== null) {
                $discount = min($discount, (float) $this->max_discount_amount);
            }
        }

        return round(min($discount, $subtotal), 2);
    }
}


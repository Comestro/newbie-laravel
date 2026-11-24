<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_default' => 'boolean',
        'mrp' => 'decimal:2',
        'retail_price' => 'decimal:2',
        'bulk_price' => 'decimal:2',
        'weight' => 'decimal:2',
    ];

    public function getIsActiveAttribute(): bool
    {
        return ($this->attributes['status'] ?? 'active') === 'active';
    }

    public function setIsActiveAttribute($value): void
    {
        $this->attributes['status'] = filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'active' : 'inactive';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function images(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_variant_id');
    }

    public function image(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductImage::class, 'product_variant_id')->latestOfMany();
    }
}

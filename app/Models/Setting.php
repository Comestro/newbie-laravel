<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $record = static::where('key', $key)->first();
        return $record ? $record->value : $default;
    }

    public static function setValue(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value]
        );
    }

    public static function getLoyaltyConfig(): array
    {
        $all = static::whereIn('key', [
            'membership_fee',
            'membership_bonus_points',
            'points_per_rupee',
            'require_membership_for_order',
        ])->pluck('value', 'key');

        return [
            'membership_fee' => (float) ($all['membership_fee'] ?? 49),
            'membership_bonus_points' => (int) ($all['membership_bonus_points'] ?? 5000),
            'points_per_rupee' => max(1, (int) ($all['points_per_rupee'] ?? 100)),
            'require_membership_for_order' => filter_var($all['require_membership_for_order'] ?? '1', FILTER_VALIDATE_BOOLEAN),
        ];
    }
}


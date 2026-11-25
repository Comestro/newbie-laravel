<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'mobile',
        'role',
        'is_active',
        'avatar_url',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function initials(): string
    {
        return Str::of($this->name)
            ->explode(' ')
            ->take(2)
            ->map(fn($word) => Str::substr($word, 0, 1))
            ->implode('');
    }

    public function retailerProfile(): HasOne
    {
        return $this->hasOne(RetailerProfile::class);
    }

    public function retailerKyc(): HasOne
    {
        return $this->hasOne(RetailerProfile::class);
    }

    public function getApplyStatusAttribute(): ?string
    {
        return $this->retailerProfile?->status;
    }

    public function getAadhaarCardAttribute(): ?string
    {
        return $this->retailerProfile?->aadhaar_card;
    }

    public function getAadhaarCardFrontAttribute(): ?string
    {
        return $this->retailerProfile?->aadhaar_card_front;
    }

    public function getAadhaarCardBackAttribute(): ?string
    {
        return $this->retailerProfile?->aadhaar_card_back;
    }

    public function getKycRejectReasonAttribute(): ?string
    {
        return $this->retailerProfile?->rejection_reason;
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isRetailer(): bool
    {
        return $this->role === UserRole::RETAILER;
    }

    public function isKycApproved(): bool
    {
        $status = strtoupper((string) ($this->retailerProfile?->status ?? ''));
        return $status === 'VERIFIED' || $status === 'APPROVED';
    }

    public function canPlaceOrder(): bool
    {
        if ($this->isRetailer()) {
            return $this->isKycApproved();
        }

        return true;
    }
}

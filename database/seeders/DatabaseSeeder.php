<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@newbie.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
        ]);

        // Retailer
        $retailer = User::create([
            'name' => 'Retailer User',
            'email' => 'retailer@newbie.com',
            'password' => Hash::make('password'),
            'role' => UserRole::RETAILER,
        ]);

        \App\Models\RetailerProfile::create([
            'user_id' => $retailer->id,
            'shop_name' => 'Demo Retail Store',
            'aadhaar_card' => '123456789012',
            'status' => 'VERIFIED',
            'approved_at' => now(),
        ]);

        // Customer
        User::create([
            'name' => 'Demo User',
            'email' => 'user@newbie.com',
            'password' => Hash::make('password'),
            'role' => UserRole::USER,
        ]);

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}

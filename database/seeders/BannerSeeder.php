<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        if (Banner::count() > 0) {
            return;
        }

        Banner::insert([
            [
                'banner_image' => 'https://ik.imagekit.io/man96/banners/milk-banner_aUC2xXq5f.svg',
                'cta_link' => '/catalog?category=milk',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'banner_image' => 'https://ik.imagekit.io/man96/banners/water-banner_-zrZ9b3kN.svg',
                'cta_link' => '/catalog?category=water',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'banner_image' => 'https://ik.imagekit.io/man96/banners/lassi-banner_sYGKrSaUq.svg',
                'cta_link' => '/catalog?category=lassi-and-beverages',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

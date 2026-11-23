<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Milk',
                'slug' => 'milk',
                'is_active' => true,
            ],
            [
                'name' => 'Water',
                'slug' => 'water',
                'is_active' => true,
            ],
            [
                'name' => 'Beverages',
                'slug' => 'beverages',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}


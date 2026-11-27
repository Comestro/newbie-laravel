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
        // Main category: Dairy
        $dairy = Category::firstOrCreate(
            ['slug' => 'dairy'],
            ['name' => 'Dairy', 'is_active' => true]
        );

        $dairySubcategories = [
            ['name' => 'Milk', 'slug' => 'milk'],
            ['name' => 'Curd / Dahi', 'slug' => 'curd-dahi'],
            ['name' => 'Paneer', 'slug' => 'paneer'],
            ['name' => 'Lassi & Beverages', 'slug' => 'lassi-and-beverages'],
        ];

        foreach ($dairySubcategories as $sub) {
            Category::updateOrCreate(
                ['slug' => $sub['slug']],
                [
                    'parent_id' => $dairy->id,
                    'name' => $sub['name'],
                    'is_active' => true,
                ]
            );
        }

        // Main category: Water
        Category::firstOrCreate(
            ['slug' => 'water'],
            ['name' => 'Water', 'is_active' => true]
        );
    }
}

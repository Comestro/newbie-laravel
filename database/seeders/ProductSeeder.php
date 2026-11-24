<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $milkCategory = Category::firstOrCreate(['name' => 'Milk'], ['slug' => 'milk', 'is_active' => true]);
        $waterCategory = Category::firstOrCreate(['name' => 'Water'], ['slug' => 'water', 'is_active' => true]);
        $beveragesCategory = Category::firstOrCreate(['name' => 'Beverages'], ['slug' => 'beverages', 'is_active' => true]);

        // 1. Milk Products
        $milk = Product::create([
            'category_id' => $milkCategory->id,
            'name' => 'Fresh Cow Milk',
            'description' => 'Pure, organic fresh cow milk delivered daily.',
            'brand' => 'FarmFresh',
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $milk->id,
            'variant_name' => '500ml Pouch',
            'unit_size' => '500ml',
            'sku' => 'MLK-500',
            'mrp' => 38.00,
            'retail_price' => 35.00,
            'bulk_price' => 32.00,
            'stock' => 100,
            'is_default' => true,
        ]);

        ProductVariant::create([
            'product_id' => $milk->id,
            'variant_name' => '1 Ltr Pouch',
            'unit_size' => '1L',
            'sku' => 'MLK-1000',
            'mrp' => 70.00,
            'retail_price' => 65.00,
            'bulk_price' => 60.00,
            'stock' => 100,
        ]);

        $buffaloMilk = Product::create([
            'category_id' => $milkCategory->id,
            'name' => 'Buffalo Milk',
            'description' => 'Rich and creamy buffalo milk.',
            'brand' => 'FarmFresh',
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $buffaloMilk->id,
            'variant_name' => '1 Ltr Bottle',
            'unit_size' => '1L',
            'sku' => 'BMLK-1000',
            'mrp' => 85.00,
            'retail_price' => 75.00,
            'bulk_price' => 70.00,
            'stock' => 50,
            'is_default' => true,
        ]);


        // 2. Water Products
        $water20 = Product::create([
            'category_id' => $waterCategory->id,
            'name' => 'Mineral Water Jar',
            'description' => '20 Litre Mineral Water Jar for home and office.',
            'brand' => 'Bisleri',
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $water20->id,
            'variant_name' => '20 Ltr Jar',
            'unit_size' => '20L',
            'sku' => 'WAT-20L',
            'mrp' => 100.00,
            'retail_price' => 90.00,
            'bulk_price' => 80.00,
            'stock' => 200,
            'is_default' => true,
        ]);

        $water1 = Product::create([
            'category_id' => $waterCategory->id,
            'name' => 'Water Bottle Box',
            'description' => 'Box of 1 Litre Water Bottles (12 pcs).',
            'brand' => 'Kinley',
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $water1->id,
            'variant_name' => '1 Ltr x 12 Box',
            'unit_size' => '12x1L',
            'sku' => 'WAT-BOX-1L',
            'mrp' => 260.00,
            'retail_price' => 240.00,
            'bulk_price' => 220.00,
            'stock' => 50,
            'is_default' => true,
        ]);


        // 3. Beverages
        $coke = Product::create([
            'category_id' => $beveragesCategory->id,
            'name' => 'Coca Cola',
            'description' => 'Refreshing soft drink.',
            'brand' => 'Coca Cola',
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $coke->id,
            'variant_name' => '750ml Bottle',
            'unit_size' => '750ml',
            'sku' => 'COKE-750',
            'mrp' => 50.00,
            'retail_price' => 45.00,
            'bulk_price' => 40.00,
            'stock' => 100,
            'is_default' => true,
        ]);

        ProductVariant::create([
            'product_id' => $coke->id,
            'variant_name' => '2.25L Bottle',
            'unit_size' => '2.25L',
            'sku' => 'COKE-2250',
            'mrp' => 110.00,
            'retail_price' => 95.00,
            'bulk_price' => 90.00,
            'stock' => 50,
        ]);

        $juice = Product::create([
            'category_id' => $beveragesCategory->id,
            'name' => 'Mango Juice',
            'description' => 'Real mango pulp juice without preservatives.',
            'brand' => 'Real',
            'status' => 'active',
        ]);

        ProductVariant::create([
            'product_id' => $juice->id,
            'variant_name' => '1 Ltr Tetrapack',
            'unit_size' => '1L',
            'sku' => 'JUC-MAN-1L',
            'mrp' => 125.00,
            'retail_price' => 110.00,
            'bulk_price' => 100.00,
            'stock' => 80,
            'is_default' => true,
        ]);
    }
}

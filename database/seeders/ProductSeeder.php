<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
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

        // Helper to attach image
        $attachImage = function ($product, $variant, $url) {
            ProductImage::firstOrCreate(
                ['product_variant_id' => $variant->id, 'url' => $url],
                [
                    'product_id' => $product->id,
                    'is_primary' => true,
                    'sort_order' => 0,
                    'alt_text' => $variant->variant_name,
                ]
            );
        };

        // 1. Milk Products
        $milk = Product::firstOrCreate(['name' => 'Fresh Cow Milk'], [
            'category_id' => $milkCategory->id,
            'description' => 'Pure, organic fresh cow milk delivered chilled daily.',
            'brand' => 'FarmFresh',
            'status' => 'active',
        ]);

        $v1 = ProductVariant::updateOrCreate(
            ['sku' => 'MLK-500'],
            [
                'product_id' => $milk->id,
                'variant_name' => '500ml Pouch',
                'unit_size' => '500ml',
                'mrp' => 38.00,
                'retail_price' => 32.00,
                'bulk_price' => 28.00,
                'min_bulk_qty' => 10,
                'stock' => 100,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($milk, $v1, $v1->image_url);

        $v2 = ProductVariant::updateOrCreate(
            ['sku' => 'MLK-1000'],
            [
                'product_id' => $milk->id,
                'variant_name' => '1 Ltr Pouch',
                'unit_size' => '1L',
                'mrp' => 70.00,
                'retail_price' => 62.00,
                'bulk_price' => 55.00,
                'min_bulk_qty' => 10,
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($milk, $v2, $v2->image_url);

        $buffaloMilk = Product::firstOrCreate(['name' => 'Buffalo Milk'], [
            'category_id' => $milkCategory->id,
            'description' => 'Rich, creamy and thick buffalo milk with high fat content.',
            'brand' => 'FarmFresh',
            'status' => 'active',
        ]);

        $v3 = ProductVariant::updateOrCreate(
            ['sku' => 'BMLK-1000'],
            [
                'product_id' => $buffaloMilk->id,
                'variant_name' => '1 Ltr Bottle',
                'unit_size' => '1L',
                'mrp' => 84.00,
                'retail_price' => 70.00,
                'bulk_price' => 64.00,
                'min_bulk_qty' => 10,
                'stock' => 50,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($buffaloMilk, $v3, $v3->image_url);

        $paneer = Product::firstOrCreate(['name' => 'Fresh Malai Paneer'], [
            'category_id' => $milkCategory->id,
            'description' => 'Soft, moist and fresh paneer made from pure whole milk.',
            'brand' => 'FarmFresh',
            'status' => 'active',
        ]);

        $v4 = ProductVariant::updateOrCreate(
            ['sku' => 'PAN-200G'],
            [
                'product_id' => $paneer->id,
                'variant_name' => '200g Pack',
                'unit_size' => '200g',
                'mrp' => 95.00,
                'retail_price' => 85.00,
                'bulk_price' => 75.00,
                'min_bulk_qty' => 5,
                'stock' => 80,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($paneer, $v4, $v4->image_url);

        $curd = Product::firstOrCreate(['name' => 'Fresh Desi Dahi / Curd'], [
            'category_id' => $milkCategory->id,
            'description' => 'Thick and delicious probiotic curd with traditional taste.',
            'brand' => 'FarmFresh',
            'status' => 'active',
        ]);

        $v5 = ProductVariant::updateOrCreate(
            ['sku' => 'DAHI-400G'],
            [
                'product_id' => $curd->id,
                'variant_name' => '400g Tub',
                'unit_size' => '400g',
                'mrp' => 45.00,
                'retail_price' => 40.00,
                'bulk_price' => 35.00,
                'min_bulk_qty' => 6,
                'stock' => 60,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($curd, $v5, $v5->image_url);

        // 2. Water Products
        $water20 = Product::firstOrCreate(['name' => 'Mineral Water Jar'], [
            'category_id' => $waterCategory->id,
            'description' => '20 Litre Mineral Water Jar for home and commercial use.',
            'brand' => 'Bisleri',
            'status' => 'active',
        ]);

        $v6 = ProductVariant::updateOrCreate(
            ['sku' => 'WAT-20L'],
            [
                'product_id' => $water20->id,
                'variant_name' => '20 Ltr Jar',
                'unit_size' => '20L',
                'mrp' => 95.00,
                'retail_price' => 80.00,
                'bulk_price' => 65.00,
                'min_bulk_qty' => 5,
                'stock' => 200,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($water20, $v6, $v6->image_url);

        $water1 = Product::firstOrCreate(['name' => 'Water Bottle Box'], [
            'category_id' => $waterCategory->id,
            'description' => 'Case of 1 Litre Mineral Water Bottles (12 bottles pack).',
            'brand' => 'Kinley',
            'status' => 'active',
        ]);

        $v7 = ProductVariant::updateOrCreate(
            ['sku' => 'WAT-BOX-1L'],
            [
                'product_id' => $water1->id,
                'variant_name' => '1 Ltr x 12 Box',
                'unit_size' => '12x1L',
                'mrp' => 264.00,
                'retail_price' => 220.00,
                'bulk_price' => 195.00,
                'min_bulk_qty' => 2,
                'stock' => 50,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1559839914-175f3a0979cb?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($water1, $v7, $v7->image_url);

        $singleWater = Product::firstOrCreate(['name' => 'Natural Mineral Water 1L'], [
            'category_id' => $waterCategory->id,
            'description' => 'Packaged purified mineral water bottle with added minerals.',
            'brand' => 'Bisleri',
            'status' => 'active',
        ]);

        $v8 = ProductVariant::updateOrCreate(
            ['sku' => 'WAT-1L-SINGLE'],
            [
                'product_id' => $singleWater->id,
                'variant_name' => '1 Litre Bottle',
                'unit_size' => '1L',
                'mrp' => 20.00,
                'retail_price' => 18.00,
                'bulk_price' => 14.00,
                'min_bulk_qty' => 12,
                'stock' => 150,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($singleWater, $v8, $v8->image_url);

        // 3. Beverages
        $coke = Product::firstOrCreate(['name' => 'Coca Cola'], [
            'category_id' => $beveragesCategory->id,
            'description' => 'Refreshing carbonated soft drink.',
            'brand' => 'Coca Cola',
            'status' => 'active',
        ]);

        $v9 = ProductVariant::updateOrCreate(
            ['sku' => 'COKE-750'],
            [
                'product_id' => $coke->id,
                'variant_name' => '750ml Bottle',
                'unit_size' => '750ml',
                'mrp' => 45.00,
                'retail_price' => 40.00,
                'bulk_price' => 34.00,
                'min_bulk_qty' => 12,
                'stock' => 100,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($coke, $v9, $v9->image_url);

        $v10 = ProductVariant::updateOrCreate(
            ['sku' => 'COKE-2250'],
            [
                'product_id' => $coke->id,
                'variant_name' => '2.25L Bottle',
                'unit_size' => '2.25L',
                'mrp' => 100.00,
                'retail_price' => 90.00,
                'bulk_price' => 80.00,
                'min_bulk_qty' => 6,
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($coke, $v10, $v10->image_url);

        $juice = Product::firstOrCreate(['name' => 'Mango Juice'], [
            'category_id' => $beveragesCategory->id,
            'description' => 'Real mango pulp juice rich in Vitamin C.',
            'brand' => 'Real',
            'status' => 'active',
        ]);

        $v11 = ProductVariant::updateOrCreate(
            ['sku' => 'JUC-MAN-1L'],
            [
                'product_id' => $juice->id,
                'variant_name' => '1 Ltr Tetrapack',
                'unit_size' => '1L',
                'mrp' => 125.00,
                'retail_price' => 105.00,
                'bulk_price' => 92.00,
                'min_bulk_qty' => 6,
                'stock' => 80,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($juice, $v11, $v11->image_url);

        $orangeJuice = Product::firstOrCreate(['name' => 'Valencia Orange Juice'], [
            'category_id' => $beveragesCategory->id,
            'description' => '100% natural Valencia orange juice without added sugar.',
            'brand' => 'Tropicana',
            'status' => 'active',
        ]);

        $v12 = ProductVariant::updateOrCreate(
            ['sku' => 'JUC-ORG-1L'],
            [
                'product_id' => $orangeJuice->id,
                'variant_name' => '1 Ltr Tetrapack',
                'unit_size' => '1L',
                'mrp' => 135.00,
                'retail_price' => 115.00,
                'bulk_price' => 98.00,
                'min_bulk_qty' => 6,
                'stock' => 70,
                'is_default' => true,
                'image_url' => 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
            ]
        );
        $attachImage($orangeJuice, $v12, $v12->image_url);
    }
}


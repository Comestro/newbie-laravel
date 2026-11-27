<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(CategorySeeder::class);

        $keepSlugs = ['dairy', 'milk', 'curd-dahi', 'paneer', 'lassi-and-beverages', 'water'];
        Category::whereNotIn('slug', $keepSlugs)->delete();

        $categories = Category::whereIn('slug', $keepSlugs)->get()->keyBy('slug');

        $catalog = [
            [
                'category' => 'milk',
                'name' => 'Medha Shakti Special',
                'brand' => 'Medha Dairy',
                'description' => 'Pasteurized & homogenized standardized milk fortified with Vitamin A & D.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-shakti-special.jpg',
                'variants' => [
                    ['sku' => 'MDH-SHK-1000', 'variant_name' => '1000ml (12 pcs)', 'unit_size' => '1000ml x 12', 'mrp' => 744.00, 'retail_price' => 720.00, 'bulk_price' => 700.00, 'min_bulk_qty' => 1, 'is_default' => true],
                    ['sku' => 'MDH-SHK-500', 'variant_name' => '500ml (24 pcs)', 'unit_size' => '500ml x 24', 'mrp' => 768.00, 'retail_price' => 744.00, 'bulk_price' => 724.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'milk',
                'name' => 'Medha Standard Milk (Gold)',
                'brand' => 'Medha Dairy',
                'description' => 'Rich pasteurized full cream milk for everyday nutrition and sweets.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-gold.jpg',
                'variants' => [
                    ['sku' => 'MDH-STD-1000', 'variant_name' => '1000ml (12 pcs)', 'unit_size' => '1000ml x 12', 'mrp' => 744.00, 'retail_price' => 720.00, 'bulk_price' => 700.00, 'min_bulk_qty' => 1, 'is_default' => true],
                    ['sku' => 'MDH-STD-500', 'variant_name' => '500ml (24 pcs)', 'unit_size' => '500ml x 24', 'mrp' => 744.00, 'retail_price' => 720.00, 'bulk_price' => 700.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'milk',
                'name' => 'Medha Toned Milk (Taaza)',
                'brand' => 'Medha Dairy',
                'description' => 'Light and healthy pasteurized toned milk fortified with Vitamin A & D.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-taaza.jpg',
                'variants' => [
                    ['sku' => 'MDH-TON-1000', 'variant_name' => '1000ml (12 pcs)', 'unit_size' => '1000ml x 12', 'mrp' => 672.00, 'retail_price' => 648.00, 'bulk_price' => 628.00, 'min_bulk_qty' => 1, 'is_default' => true],
                    ['sku' => 'MDH-TON-500', 'variant_name' => '500ml (24 pcs)', 'unit_size' => '500ml x 24', 'mrp' => 672.00, 'retail_price' => 648.00, 'bulk_price' => 628.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'milk',
                'name' => 'Medha Double Toned Milk',
                'brand' => 'Medha Dairy',
                'description' => 'Low-fat double toned milk ideal for fitness and light daily consumption.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-shakti.jpg',
                'variants' => [
                    ['sku' => 'MDH-DTN-1000', 'variant_name' => '1000ml (12 pcs)', 'unit_size' => '1000ml x 12', 'mrp' => 624.00, 'retail_price' => 600.00, 'bulk_price' => 580.00, 'min_bulk_qty' => 1, 'is_default' => true],
                    ['sku' => 'MDH-DTN-500', 'variant_name' => '500ml (24 pcs)', 'unit_size' => '500ml x 24', 'mrp' => 624.00, 'retail_price' => 600.00, 'bulk_price' => 580.00, 'min_bulk_qty' => 1],
                    ['sku' => 'MDH-DTN-200', 'variant_name' => '200ml (50 pcs)', 'unit_size' => '200ml x 50', 'mrp' => 500.00, 'retail_price' => 450.00, 'bulk_price' => 432.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'milk',
                'name' => 'Medha Cow Milk',
                'brand' => 'Medha Dairy',
                'description' => 'Pure pasteurized cow milk, easy to digest and naturally nutritious.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-cow-milk.jpg',
                'variants' => [
                    ['sku' => 'MDH-COW-500', 'variant_name' => '500ml (24 pcs)', 'unit_size' => '500ml x 24', 'mrp' => 696.00, 'retail_price' => 672.00, 'bulk_price' => 652.00, 'min_bulk_qty' => 1, 'is_default' => true],
                ],
            ],
            [
                'category' => 'paneer',
                'name' => 'Medha Fresh Paneer',
                'brand' => 'Medha Dairy',
                'description' => 'Soft and fresh cottage cheese made from pure Medha milk.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-range.jpg',
                'variants' => [
                    ['sku' => 'MDH-PAN-1KG', 'variant_name' => '1kg (2 pcs / box)', 'unit_size' => '1kg x 2', 'mrp' => 840.00, 'retail_price' => 760.00, 'bulk_price' => 730.00, 'min_bulk_qty' => 1, 'is_default' => true],
                    ['sku' => 'MDH-PAN-200G', 'variant_name' => '200gm (10 pcs / box)', 'unit_size' => '200g x 10', 'mrp' => 900.00, 'retail_price' => 820.00, 'bulk_price' => 770.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'lassi-and-beverages',
                'name' => 'Medha Lassi',
                'brand' => 'Medha Dairy',
                'description' => 'Cool and refreshing sweet dairy lassi.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-lassi.jpg',
                'variants' => [
                    ['sku' => 'MDH-LAS-150', 'variant_name' => '150ml (52 pcs)', 'unit_size' => '150ml x 52', 'mrp' => 520.00, 'retail_price' => 450.00, 'bulk_price' => 430.00, 'min_bulk_qty' => 1, 'is_default' => true],
                    ['sku' => 'MDH-LAS-UHT', 'variant_name' => 'Lassi UHT (30 pcs / box)', 'unit_size' => 'UHT x 30', 'mrp' => 600.00, 'retail_price' => 530.00, 'bulk_price' => 503.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'lassi-and-beverages',
                'name' => 'Medha EnerG Flavour Milk',
                'brand' => 'Medha Dairy',
                'description' => 'Chilled flavoured milk available in Kesar Pista, Mango, Chocolate, and Elaichi.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-flavour-milk.jpg',
                'variants' => [
                    ['sku' => 'MDH-FLV-200', 'variant_name' => '200ml (24 pcs / box)', 'unit_size' => '200ml x 24', 'mrp' => 600.00, 'retail_price' => 520.00, 'bulk_price' => 485.00, 'min_bulk_qty' => 1, 'is_default' => true],
                ],
            ],
            [
                'category' => 'curd-dahi',
                'name' => 'Medha Plain Dahi Cup',
                'brand' => 'Medha Dairy',
                'description' => 'Thick, creamy TaaZaa plain dahi packed in hygienic 200gm cups.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-dahi-cup.jpg',
                'variants' => [
                    ['sku' => 'MDH-DAC-200', 'variant_name' => '200gm (12 pcs / box)', 'unit_size' => '200g x 12', 'mrp' => 264.00, 'retail_price' => 240.00, 'bulk_price' => 230.00, 'min_bulk_qty' => 1, 'is_default' => true],
                ],
            ],
            [
                'category' => 'curd-dahi',
                'name' => 'Medha Mishti Doi',
                'brand' => 'Medha Dairy',
                'description' => 'Traditional sweetened curd (Mishti Doi) in convenient 80gm cups.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-mishti-doi.jpg',
                'variants' => [
                    ['sku' => 'MDH-MIS-80', 'variant_name' => '80gm (12 pcs / box)', 'unit_size' => '80g x 12', 'mrp' => 120.00, 'retail_price' => 108.00, 'bulk_price' => 103.00, 'min_bulk_qty' => 1, 'is_default' => true],
                ],
            ],
            [
                'category' => 'curd-dahi',
                'name' => 'Medha TaaZaa Dahi Pouch',
                'brand' => 'Medha Dairy',
                'description' => 'Fresh probiotic TaaZaa dahi in sealed pouches.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-dahi-pouch.jpg',
                'variants' => [
                    ['sku' => 'MDH-DAP-1000', 'variant_name' => '1000gm Pouch (12 pcs)', 'unit_size' => '1000g x 12', 'mrp' => 900.00, 'retail_price' => 864.00, 'bulk_price' => 836.00, 'min_bulk_qty' => 1, 'is_default' => true],
                    ['sku' => 'MDH-DAP-400', 'variant_name' => '400gm Pouch (24 pcs)', 'unit_size' => '400g x 24', 'mrp' => 768.00, 'retail_price' => 768.00, 'bulk_price' => 735.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'curd-dahi',
                'name' => 'Medha Plain Dahi Bucket',
                'brand' => 'Medha Dairy',
                'description' => 'Family and bulk catering buckets of thick Medha TaaZaa Dahi.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/medha-dahi-bucket.jpg',
                'variants' => [
                    ['sku' => 'MDH-DAB-1KG', 'variant_name' => '1kg Bucket (per unit)', 'unit_size' => '1kg', 'mrp' => 110.00, 'retail_price' => 105.00, 'bulk_price' => 97.00, 'min_bulk_qty' => 5, 'is_default' => true],
                    ['sku' => 'MDH-DAB-5KG', 'variant_name' => '5kg Bucket (per unit)', 'unit_size' => '5kg', 'mrp' => 500.00, 'retail_price' => 480.00, 'bulk_price' => 460.00, 'min_bulk_qty' => 2],
                    ['sku' => 'MDH-DAB-15KG', 'variant_name' => '15kg Bucket (per unit)', 'unit_size' => '15kg', 'mrp' => 1380.00, 'retail_price' => 1300.00, 'bulk_price' => 1245.00, 'min_bulk_qty' => 1],
                ],
            ],
            [
                'category' => 'water',
                'name' => 'Bailley Packaged Drinking Water',
                'brand' => 'Bailley',
                'description' => 'Pure packaged drinking water with added minerals.',
                'image' => 'https://ik.imagekit.io/man96/products/seeded/bailley-water.jpg',
                'variants' => [
                    ['sku' => 'BLY-WTR-1L', 'variant_name' => '1 Ltr Bottle', 'unit_size' => '1L', 'mrp' => 20.00, 'retail_price' => 18.00, 'bulk_price' => 14.00, 'min_bulk_qty' => 12, 'is_default' => true],
                ],
            ],
        ];

        foreach ($catalog as $item) {
            $category = $categories->get($item['category']);
            if (!$category) {
                continue;
            }

            $product = Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'category_id' => $category->id,
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'brand' => $item['brand'],
                    'status' => 'active',
                ]
            );

            foreach ($item['variants'] as $v) {
                $variant = ProductVariant::updateOrCreate(
                    ['sku' => $v['sku']],
                    [
                        'product_id' => $product->id,
                        'variant_name' => $v['variant_name'],
                        'unit_size' => $v['unit_size'],
                        'mrp' => $v['mrp'],
                        'retail_price' => $v['retail_price'],
                        'bulk_price' => $v['bulk_price'],
                        'min_bulk_qty' => $v['min_bulk_qty'] ?? 1,
                        'stock' => 100,
                        'is_default' => $v['is_default'] ?? false,
                        'image_url' => $item['image'],
                        'status' => 'active',
                    ]
                );

                ProductImage::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'product_variant_id' => $variant->id,
                        'sort_order' => 0,
                    ],
                    [
                        'url' => $item['image'],
                        'thumbnail_url' => str_replace('https://ik.imagekit.io/man96/', 'https://ik.imagekit.io/man96/tr:n-ik_ml_thumbnail/', $item['image']),
                        'is_primary' => true,
                        'alt_text' => "{$product->name} - {$variant->variant_name}",
                    ]
                );
            }
        }
    }
}

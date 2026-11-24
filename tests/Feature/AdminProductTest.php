<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::ADMIN,
            'email_verified_at' => now(),
        ]);

        $this->customer = User::factory()->create([
            'role' => UserRole::USER,
            'email_verified_at' => now(),
        ]);

        $this->category = Category::create([
            'name' => 'Dairy & Milk',
            'slug' => 'dairy-and-milk',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_products_list(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/products');
        $response->assertStatus(200);
    }

    public function test_admin_can_filter_products(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Pasteurized Milk',
            'slug' => 'pasteurized-milk',
            'brand' => 'Amul',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Pasteurized Milk - 1L',
            'unit_size' => '1L',
            'mrp' => 65.00,
            'retail_price' => 60,
            'bulk_price' => 52,
            'min_bulk_qty' => 10,
            'stock' => 50,
            'sku' => 'AMUL-PAST-1L',
            'is_default' => true,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/products?search=Pasteurized&category_id=' . $this->category->id . '&status=active');
        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_products(): void
    {
        $response = $this->actingAs($this->customer)->get('/admin/products');
        $response->assertStatus(403);
    }

    public function test_admin_can_create_product_with_variants(): void
    {
        $payload = [
            'name' => 'Fresh Cow Milk',
            'brand' => 'FarmFresh',
            'category_id' => $this->category->id,
            'description' => '100% pure cow milk directly from organic farms.',
            'is_active' => true,
            'variants' => [
                [
                    'unit_size' => '500ml',
                    'mrp' => 35.00,
                    'retail_price' => 30.00,
                    'bulk_price' => 26.00,
                    'min_bulk_qty' => 20,
                    'stock' => 150,
                    'sku' => 'COW-MILK-500ML',
                    'image_url' => 'https://example.com/milk-500ml.jpg',
                ],
                [
                    'unit_size' => '1000ml',
                    'mrp' => 65.00,
                    'retail_price' => 58.00,
                    'bulk_price' => 50.00,
                    'min_bulk_qty' => 10,
                    'stock' => 80,
                    'sku' => 'COW-MILK-1000ML',
                    'image_url' => 'https://example.com/milk-1000ml.jpg',
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/products', $payload);

        $response->assertRedirect('/admin/products');

        $this->assertDatabaseHas('products', [
            'name' => 'Fresh Cow Milk',
            'brand' => 'FarmFresh',
            'category_id' => $this->category->id,
        ]);

        $product = Product::where('slug', 'fresh-cow-milk')->first();
        $this->assertNotNull($product);
        $this->assertCount(2, $product->variants);

        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'unit_size' => '500ml',
            'mrp' => 35.00,
            'retail_price' => 30.00,
            'bulk_price' => 26.00,
            'stock' => 150,
            'sku' => 'COW-MILK-500ML',
            'is_default' => 1,
        ]);

        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'unit_size' => '1000ml',
            'mrp' => 65.00,
            'retail_price' => 58.00,
            'bulk_price' => 50.00,
            'stock' => 80,
            'sku' => 'COW-MILK-1000ML',
            'is_default' => 0,
        ]);
    }

    public function test_mrp_and_bulk_price_are_required_for_variants(): void
    {
        $payload = [
            'name' => 'Validation Test Product',
            'brand' => 'Brand Test',
            'category_id' => $this->category->id,
            'is_active' => true,
            'variants' => [
                [
                    'unit_size' => '1L',
                    'mrp' => '',
                    'retail_price' => 50.00,
                    'bulk_price' => '',
                    'stock' => 10,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/products', $payload);
        $response->assertSessionHasErrors([
            'variants.0.mrp',
            'variants.0.bulk_price',
        ]);
    }

    public function test_admin_can_update_product_and_manage_variants(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Butter',
            'slug' => 'butter',
            'brand' => 'Amul',
            'is_active' => true,
        ]);

        $variant1 = ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Butter - 100g',
            'unit_size' => '100g',
            'mrp' => 60.00,
            'retail_price' => 55.00,
            'bulk_price' => 48.00,
            'stock' => 40,
            'sku' => 'BUTTER-100G',
            'is_default' => true,
        ]);

        $variant2 = ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Butter - 500g',
            'unit_size' => '500g',
            'mrp' => 280.00,
            'retail_price' => 260.00,
            'bulk_price' => 240.00,
            'stock' => 20,
            'sku' => 'BUTTER-500G',
            'is_default' => false,
        ]);

        // Update product: modify variant1, delete variant2, add new variant3
        $payload = [
            'name' => 'Amul Salted Butter',
            'brand' => 'Amul',
            'category_id' => $this->category->id,
            'description' => 'Delicious salted butter made from pure milk fat.',
            'is_active' => true,
            'variants' => [
                [
                    'id' => $variant1->id,
                    'unit_size' => '100g Pack',
                    'mrp' => 62.00,
                    'retail_price' => 58.00,
                    'bulk_price' => 50.00,
                    'min_bulk_qty' => 15,
                    'stock' => 60,
                    'sku' => 'BUTTER-100G-V2',
                ],
                [
                    'id' => null,
                    'unit_size' => '200g Pack',
                    'mrp' => 120.00,
                    'retail_price' => 110.00,
                    'bulk_price' => 98.00,
                    'min_bulk_qty' => 10,
                    'stock' => 30,
                    'sku' => 'BUTTER-200G',
                ],
            ],
            'deleted_variant_ids' => [$variant2->id],
        ];

        $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", $payload);
        $response->assertRedirect('/admin/products');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Amul Salted Butter',
            'slug' => 'amul-salted-butter',
        ]);

        // Variant 1 was updated
        $this->assertDatabaseHas('product_variants', [
            'id' => $variant1->id,
            'unit_size' => '100g Pack',
            'mrp' => 62.00,
            'retail_price' => 58.00,
            'sku' => 'BUTTER-100G-V2',
        ]);

        // Variant 2 was deleted
        $this->assertDatabaseMissing('product_variants', [
            'id' => $variant2->id,
        ]);

        // Variant 3 was created
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'unit_size' => '200g Pack',
            'mrp' => 120.00,
            'retail_price' => 110.00,
            'sku' => 'BUTTER-200G',
        ]);
    }

    public function test_admin_can_toggle_active_status(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Ghee',
            'slug' => 'ghee',
            'brand' => 'Amul',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)->post("/admin/products/{$product->id}/toggle-active");
        $this->assertEquals('inactive', $product->fresh()->status);
        $this->assertFalse($product->fresh()->is_active);

        $this->actingAs($this->admin)->post("/admin/products/{$product->id}/toggle-active");
        $this->assertEquals('active', $product->fresh()->status);
        $this->assertTrue($product->fresh()->is_active);
    }

    public function test_admin_can_delete_product(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Yogurt',
            'slug' => 'yogurt',
            'brand' => 'Mother Dairy',
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Yogurt - 400g',
            'unit_size' => '400g',
            'mrp' => 50.00,
            'retail_price' => 45.00,
            'bulk_price' => 40.00,
            'stock' => 30,
            'sku' => 'YOGURT-400G',
            'is_default' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/products/{$product->id}");
        $response->assertRedirect('/admin/products');

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
        $this->assertDatabaseMissing('product_variants', ['id' => $variant->id]);
    }

    public function test_admin_can_create_product_with_image_file(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('cow-milk.jpg', 600, 600);

        $payload = [
            'name' => 'Organic Fresh Milk',
            'brand' => 'FarmFresh',
            'category_id' => $this->category->id,
            'description' => 'Organic milk directly from farm.',
            'is_active' => true,
            'variants' => [
                [
                    'unit_size' => '1L',
                    'mrp' => 70.00,
                    'retail_price' => 64.00,
                    'bulk_price' => 55.00,
                    'min_bulk_qty' => 10,
                    'stock' => 50,
                    'sku' => 'ORG-MILK-1L',
                    'image_file' => $file,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/products', $payload);
        $response->assertRedirect('/admin/products');

        $product = Product::where('slug', 'organic-fresh-milk')->first();
        $this->assertNotNull($product);

        $variant = $product->variants()->first();
        $this->assertNotNull($variant);
        $this->assertStringContainsString('/storage/products/', $variant->image_url);

        $this->assertDatabaseHas('product_images', [
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'is_primary' => 1,
        ]);
    }

    public function test_admin_can_create_product_with_imagekit_upload(): void
    {
        config([
            'services.imagekit.public_key' => 'test_public_key',
            'services.imagekit.private_key' => 'test_private_key',
            'services.imagekit.url_endpoint' => 'https://ik.imagekit.io/test',
        ]);

        Http::fake([
            'https://upload.imagekit.io/api/v1/files/upload' => Http::response([
                'fileId' => 'ik_file_98765',
                'name' => 'butter.jpg',
                'url' => 'https://ik.imagekit.io/test/products/butter.jpg',
                'thumbnailUrl' => 'https://ik.imagekit.io/test/tr:n-media_library_thumbnail/products/butter.jpg',
                'filePath' => '/products/butter.jpg',
            ], 200),
        ]);

        $file = UploadedFile::fake()->image('butter.jpg');

        $payload = [
            'name' => 'White Butter',
            'brand' => 'FarmFresh',
            'category_id' => $this->category->id,
            'is_active' => true,
            'variants' => [
                [
                    'unit_size' => '500g',
                    'mrp' => 250.00,
                    'retail_price' => 230.00,
                    'bulk_price' => 200.00,
                    'min_bulk_qty' => 5,
                    'stock' => 25,
                    'sku' => 'WHITE-BUTTER-500G',
                    'image_file' => $file,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/products', $payload);
        $response->assertRedirect('/admin/products');

        $product = Product::where('slug', 'white-butter')->first();
        $variant = $product->variants()->first();

        $this->assertEquals('https://ik.imagekit.io/test/products/butter.jpg', $variant->image_url);

        $this->assertDatabaseHas('product_images', [
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://ik.imagekit.io/test/products/butter.jpg',
            'file_id' => 'ik_file_98765',
            'is_primary' => 1,
        ]);
    }

    public function test_deleting_variant_removes_associated_product_image(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Paneer Pack',
            'slug' => 'paneer-pack',
            'brand' => 'Amul',
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Paneer - 200g',
            'unit_size' => '200g',
            'mrp' => 90.00,
            'retail_price' => 85.00,
            'bulk_price' => 75.00,
            'stock' => 40,
            'sku' => 'PANEER-200G',
            'image_url' => 'https://example.com/paneer.jpg',
            'is_default' => true,
        ]);

        $image = ProductImage::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://example.com/paneer.jpg',
            'file_id' => null,
            'is_primary' => true,
        ]);

        $payload = [
            'name' => 'Paneer Pack',
            'brand' => 'Amul',
            'category_id' => $this->category->id,
            'is_active' => true,
            'variants' => [
                [
                    'id' => null,
                    'unit_size' => '500g',
                    'mrp' => 200.00,
                    'retail_price' => 190.00,
                    'bulk_price' => 170.00,
                    'min_bulk_qty' => 10,
                    'stock' => 20,
                    'sku' => 'PANEER-500G',
                ],
            ],
            'deleted_variant_ids' => [$variant->id],
        ];

        $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", $payload);
        $response->assertRedirect('/admin/products');

        $this->assertDatabaseMissing('product_variants', ['id' => $variant->id]);
        $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
    }

    public function test_artisan_route_access_with_admin_middleware(): void
    {
        $response = $this->actingAs($this->admin)->get('/artisan');
        $response->assertStatus(200);

        $responseCustomer = $this->actingAs($this->customer)->get('/artisan');
        $responseCustomer->assertStatus(403);
    }

    public function test_admin_can_create_variant_with_multiple_images(): void
    {
        Storage::fake('public');

        $file1 = UploadedFile::fake()->image('cow-milk-front.jpg', 600, 600);
        $file2 = UploadedFile::fake()->image('cow-milk-back.jpg', 600, 600);

        $payload = [
            'name' => 'Premium Cow Milk',
            'brand' => 'FarmFresh',
            'category_id' => $this->category->id,
            'is_active' => true,
            'variants' => [
                [
                    'unit_size' => '1L',
                    'mrp' => 75.00,
                    'retail_price' => 68.00,
                    'bulk_price' => 60.00,
                    'min_bulk_qty' => 10,
                    'stock' => 50,
                    'sku' => 'PREM-MILK-1L',
                    'image_files' => [$file1, $file2],
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/products', $payload);
        $response->assertRedirect('/admin/products');

        $product = Product::where('slug', 'premium-cow-milk')->first();
        $this->assertNotNull($product);

        $variant = $product->variants()->first();
        $this->assertNotNull($variant);

        // Variant has 2 images in product_images table
        $images = ProductImage::where('product_variant_id', $variant->id)->orderBy('sort_order', 'asc')->get();
        $this->assertCount(2, $images);

        $this->assertTrue($images[0]->is_primary);
        $this->assertEquals(0, $images[0]->sort_order);
        $this->assertFalse($images[1]->is_primary);
        $this->assertEquals(1, $images[1]->sort_order);

        // Variant image_url synced to first image
        $this->assertEquals($images[0]->url, $variant->image_url);
    }

    public function test_admin_can_delete_individual_image_from_variant(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Almond Milk',
            'slug' => 'almond-milk',
            'brand' => 'NutriFarm',
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Almond Milk - 1L',
            'unit_size' => '1L',
            'mrp' => 180.00,
            'retail_price' => 160.00,
            'bulk_price' => 140.00,
            'stock' => 30,
            'sku' => 'ALMOND-1L',
            'image_url' => 'https://example.com/almond-1.jpg',
            'is_default' => true,
        ]);

        $image1 = ProductImage::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://example.com/almond-1.jpg',
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        $image2 = ProductImage::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://example.com/almond-2.jpg',
            'sort_order' => 1,
            'is_primary' => false,
        ]);

        $payload = [
            'name' => 'Almond Milk',
            'brand' => 'NutriFarm',
            'category_id' => $this->category->id,
            'is_active' => true,
            'variants' => [
                [
                    'id' => $variant->id,
                    'unit_size' => '1L',
                    'mrp' => 180.00,
                    'retail_price' => 160.00,
                    'bulk_price' => 140.00,
                    'min_bulk_qty' => 10,
                    'stock' => 30,
                    'sku' => 'ALMOND-1L',
                ],
            ],
            'deleted_image_ids' => [$image1->id],
        ];

        $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", $payload);
        $response->assertRedirect('/admin/products');

        $this->assertDatabaseMissing('product_images', ['id' => $image1->id]);
        $this->assertDatabaseHas('product_images', ['id' => $image2->id]);

        // Variant image_url synced to the remaining image
        $variant->refresh();
        $this->assertEquals('https://example.com/almond-2.jpg', $variant->image_url);
    }

    public function test_product_creation_generates_unique_slug_when_name_collides(): void
    {
        Product::create([
            'category_id' => $this->category->id,
            'name' => 'Organic Butter',
            'slug' => 'organic-butter',
            'brand' => 'Amul',
            'is_active' => true,
        ]);

        $payload = [
            'name' => 'Organic Butter',
            'brand' => 'Mother Dairy',
            'category_id' => $this->category->id,
            'is_active' => true,
            'variants' => [
                [
                    'unit_size' => '500g',
                    'mrp' => 260.00,
                    'retail_price' => 240.00,
                    'bulk_price' => 220.00,
                    'stock' => 20,
                    'sku' => 'MD-ORG-BUTTER-500G',
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->post('/admin/products', $payload);
        $response->assertRedirect('/admin/products');

        $this->assertDatabaseHas('products', [
            'name' => 'Organic Butter',
            'slug' => 'organic-butter-1',
            'brand' => 'Mother Dairy',
        ]);
    }

    public function test_admin_can_set_variant_cover_image(): void
    {
        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Cashew Butter',
            'slug' => 'cashew-butter',
            'brand' => 'NutriFarm',
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Cashew Butter - 250g',
            'unit_size' => '250g',
            'mrp' => 350.00,
            'retail_price' => 300.00,
            'bulk_price' => 280.00,
            'min_bulk_qty' => 5,
            'stock' => 50,
            'sku' => 'CB-250G',
            'image_url' => 'https://example.com/cashew-1.jpg',
            'is_default' => true,
            'is_active' => true,
        ]);

        $image1 = ProductImage::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://example.com/cashew-1.jpg',
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        $image2 = ProductImage::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => 'https://example.com/cashew-2.jpg',
            'sort_order' => 1,
            'is_primary' => false,
        ]);

        $payload = [
            'name' => 'Cashew Butter',
            'brand' => 'NutriFarm',
            'category_id' => $this->category->id,
            'is_active' => true,
            'variants' => [
                [
                    'id' => $variant->id,
                    'unit_size' => '250g',
                    'mrp' => 350.00,
                    'retail_price' => 300.00,
                    'bulk_price' => 280.00,
                    'min_bulk_qty' => 5,
                    'stock' => 50,
                    'sku' => 'CB-250G',
                    'cover_image_id' => $image2->id,
                ],
            ],
        ];

        $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", $payload);
        $response->assertRedirect('/admin/products');

        $image1->refresh();
        $image2->refresh();
        $variant->refresh();

        $this->assertFalse((bool) $image1->is_primary);
        $this->assertTrue((bool) $image2->is_primary);
        $this->assertEquals('https://example.com/cashew-2.jpg', $variant->image_url);
    }
}


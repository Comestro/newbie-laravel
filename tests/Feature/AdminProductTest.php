<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        $this->assertFalse($product->fresh()->is_active);

        $this->actingAs($this->admin)->post("/admin/products/{$product->id}/toggle-active");
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
}


<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCategoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

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
    }

    public function test_admin_can_view_categories_list(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/categories');

        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_categories(): void
    {
        $response = $this->actingAs($this->customer)->get('/admin/categories');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_new_category(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/categories', [
            'name' => 'Organic Snacks',
            'slug' => 'organic-snacks',
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/categories');
        $this->assertDatabaseHas('categories', [
            'name' => 'Organic Snacks',
            'slug' => 'organic-snacks',
        ]);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::create([
            'name' => 'Old Category',
            'slug' => 'old-category',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/categories/{$category->id}", [
            'name' => 'Updated Category',
            'slug' => 'updated-category',
            'is_active' => false,
        ]);

        $response->assertRedirect('/admin/categories');
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
            'is_active' => 0,
        ]);
    }

    public function test_admin_can_toggle_active_status(): void
    {
        $category = Category::create([
            'name' => 'Toggle Cat',
            'slug' => 'toggle-cat',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)->post("/admin/categories/{$category->id}/toggle-active");

        $this->assertFalse($category->fresh()->is_active);
    }

    public function test_admin_can_delete_category_with_products(): void
    {
        $category = Category::create([
            'name' => 'Dairy Test',
            'slug' => 'dairy-test',
            'is_active' => true,
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Cow Milk Test',
            'slug' => 'cow-milk-test',
            'brand' => 'FarmFresh',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/categories/{$category->id}");

        $response->assertRedirect('/admin/categories');
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_admin_can_create_and_delete_parent_category_with_all_subcategories(): void
    {
        $parent = Category::create([
            'name' => 'Dairy',
            'slug' => 'dairy',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/categories', [
            'parent_id' => $parent->id,
            'name' => 'Paneer & Cheese',
            'slug' => 'paneer-and-cheese',
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/categories');
        $child = Category::where('slug', 'paneer-and-cheese')->firstOrFail();

        $grandchild = Category::create([
            'parent_id' => $child->id,
            'name' => 'Fresh Paneer',
            'slug' => 'fresh-paneer',
            'is_active' => true,
        ]);

        // Deleting parent deletes all nested subcategories as well
        $this->actingAs($this->admin)
            ->delete("/admin/categories/{$parent->id}")
            ->assertRedirect('/admin/categories');

        $this->assertDatabaseMissing('categories', ['id' => $parent->id]);
        $this->assertDatabaseMissing('categories', ['id' => $child->id]);
        $this->assertDatabaseMissing('categories', ['id' => $grandchild->id]);
    }

    public function test_catalog_filter_by_parent_category_includes_subcategory_products(): void
    {
        $parent = Category::create([
            'name' => 'Beverages Main',
            'slug' => 'beverages-main',
            'is_active' => true,
        ]);

        $sub = Category::create([
            'parent_id' => $parent->id,
            'name' => 'Cold Drinks',
            'slug' => 'cold-drinks',
            'is_active' => true,
        ]);

        $mango = Product::create([
            'category_id' => $sub->id,
            'name' => 'Mango Juice',
            'slug' => 'mango-juice',
            'brand' => 'FreshCo',
            'status' => 'active',
        ]);
        ProductVariant::create([
            'product_id' => $mango->id,
            'variant_name' => 'Mango Juice - 1L',
            'unit_size' => '1L',
            'mrp' => 100,
            'retail_price' => 90,
            'bulk_price' => 80,
            'stock' => 10,
            'sku' => 'MANGO-1L',
            'status' => 'active',
        ]);

        $this->get('/catalog?category=beverages-main')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Mango Juice')
            );
    }

    public function test_multi_level_category_tree_and_circular_parent_prevention(): void
    {
        $root = Category::create(['name' => 'abc', 'slug' => 'abc', 'is_active' => true]);
        $level2 = Category::create(['parent_id' => $root->id, 'name' => 'a/b', 'slug' => 'a-b', 'is_active' => true]);

        $this->actingAs($this->admin)->post('/admin/categories', [
            'parent_id' => $level2->id,
            'name' => 'ab/cd',
            'slug' => 'ab-cd',
            'is_active' => true,
        ])->assertRedirect('/admin/categories');

        $level3 = Category::where('slug', 'ab-cd')->firstOrFail();
        $this->assertEquals($level2->id, $level3->parent_id);

        // Tree path & depth
        $tree = Category::flatTree(onlyActive: false)->keyBy('id');
        $this->assertEquals(0, $tree[$root->id]->depth);
        $this->assertEquals(1, $tree[$level2->id]->depth);
        $this->assertEquals(2, $tree[$level3->id]->depth);
        $this->assertEquals('abc → a/b → ab/cd', $tree[$level3->id]->path);

        // Circular parent attempt (setting root's parent to level3) is blocked
        $this->actingAs($this->admin)->put("/admin/categories/{$root->id}", [
            'parent_id' => $level3->id,
            'name' => 'abc',
            'slug' => 'abc',
            'is_active' => true,
        ])->assertRedirect('/admin/categories');
        $this->assertNull($root->fresh()->parent_id);

        // Product in 3rd-level category appears when filtering catalog by root category
        $nested = Product::create([
            'category_id' => $level3->id,
            'name' => 'Deep Nested Item',
            'slug' => 'deep-nested-item',
            'brand' => 'TestBrand',
            'status' => 'active',
        ]);
        ProductVariant::create([
            'product_id' => $nested->id,
            'variant_name' => 'Deep Nested Item - 1pc',
            'unit_size' => '1pc',
            'mrp' => 50,
            'retail_price' => 45,
            'bulk_price' => 40,
            'stock' => 10,
            'sku' => 'NESTED-1PC',
            'status' => 'active',
        ]);

        $this->get('/catalog?category=abc')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Deep Nested Item')
            );
    }

    public function test_admin_can_create_and_update_category_with_icon_and_image(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin)->post('/admin/categories', [
            'name' => 'Snacks',
            'icon' => '🍪',
            'is_active' => true,
        ])->assertRedirect('/admin/categories');

        $category = Category::where('slug', 'snacks')->firstOrFail();
        $this->assertEquals('🍪', $category->icon);

        $file = UploadedFile::fake()->image('snacks.png');
        $this->actingAs($this->admin)->post("/admin/categories/{$category->id}", [
            '_method' => 'PUT',
            'name' => 'Snacks',
            'image_file' => $file,
            'is_active' => true,
        ])->assertRedirect('/admin/categories');

        $this->assertNotNull($category->fresh()->icon);
        $this->assertNotEquals('🍪', $category->fresh()->icon);

        // Reset back to default (null)
        $this->actingAs($this->admin)->put("/admin/categories/{$category->id}", [
            'name' => 'Snacks',
            'remove_icon' => true,
            'is_active' => true,
        ])->assertRedirect('/admin/categories');

        $this->assertNull($category->fresh()->icon);
    }
}

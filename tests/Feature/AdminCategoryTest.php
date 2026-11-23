<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_admin_cannot_delete_category_with_products(): void
    {
        $category = Category::create([
            'name' => 'Dairy Test',
            'slug' => 'dairy-test',
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Cow Milk Test',
            'slug' => 'cow-milk-test',
            'brand' => 'FarmFresh',
            'category' => 'Dairy Test',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete("/admin/categories/{$category->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }
}

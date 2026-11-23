<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InertiaRoutesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_routes_render_inertia(): void
    {
        $this->get('/')->assertStatus(200);
        $this->get('/catalog')->assertStatus(200);
        $this->get('/login')->assertStatus(200);
        $this->get('/register')->assertStatus(200);
        $this->get('/forgot-password')->assertStatus(200);
    }

    public function test_user_can_access_customer_portal(): void
    {
        $user = User::where('email', 'user@newbie.com')->first();
        $this->actingAs($user)->get('/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/my-orders')->assertStatus(200);
        $this->actingAs($user)->get('/my-addresses')->assertStatus(200);
        $this->actingAs($user)->get('/wishlist')->assertStatus(200);
        $this->actingAs($user)->get('/profile')->assertStatus(200);
        $this->actingAs($user)->get('/apply-to-retailer')->assertStatus(200);
    }

    public function test_admin_can_access_admin_panel(): void
    {
        $admin = User::where('email', 'admin@newbie.com')->first();
        $this->actingAs($admin)->get('/admin/dashboard')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/products')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/products/create')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/orders')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/review-retailer')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/customers')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/categories')->assertStatus(200);
        $this->actingAs($admin)->get('/admin/categories/create')->assertStatus(200);
    }

    public function test_retailer_can_access_retailer_dashboard(): void
    {
        $retailer = User::where('email', 'retailer@newbie.com')->first();
        $this->actingAs($retailer)->get('/retailer/dashboard')->assertStatus(200);
    }
}

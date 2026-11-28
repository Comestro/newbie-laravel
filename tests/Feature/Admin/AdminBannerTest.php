<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Jobs\UploadImageToImageKit;
use App\Models\Banner;
use App\Models\User;
use App\Services\ImageKitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminBannerTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_banners(): void
    {
        $customer = User::factory()->create(['role' => UserRole::USER]);

        $this->actingAs($customer)
            ->get(route('admin.banners.index'))
            ->assertStatus(403);
    }

    public function test_admin_can_crud_toggle_and_queue_banner_image(): void
    {
        Queue::fake();
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        // 1. Index shows seeded default banners
        $this->actingAs($admin)
            ->get(route('admin.banners.index'))
            ->assertOk();

        // 2. Create banner with queued image upload
        $this->actingAs($admin)->post(route('admin.banners.store'), [
            'cta_link' => '/catalog?category=lassi-and-beverages',
            'sort_order' => 4,
            'is_active' => true,
            'image_file' => UploadedFile::fake()->image('banner.jpg'),
        ])->assertRedirect(route('admin.banners.index'));

        $banner = Banner::orderByDesc('id')->first();
        $this->assertNotNull($banner);
        $this->assertEquals('/catalog?category=lassi-and-beverages', $banner->cta_link);
        $this->assertTrue($banner->is_active);

        Queue::assertPushed(UploadImageToImageKit::class, fn ($job) => $job->modelClass === Banner::class && $job->modelId === $banner->id && $job->folder === '/banners');

        // 3. Update banner
        $this->actingAs($admin)->post(route('admin.banners.update', $banner->id), [
            'cta_link' => '/catalog',
            'sort_order' => 1,
            'is_active' => true,
        ])->assertRedirect(route('admin.banners.index'));

        $this->assertDatabaseHas('banners', [
            'id' => $banner->id,
            'cta_link' => '/catalog',
            'sort_order' => 1,
        ]);

        // 4. Toggle active
        $this->actingAs($admin)
            ->post(route('admin.banners.toggle-active', $banner->id))
            ->assertRedirect();

        $this->assertFalse($banner->fresh()->is_active);

        // 5. Public home page only receives active banners
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Shop/Home')
                ->has('banners', 0)
            );

        $this->actingAs($admin)
            ->post(route('admin.banners.toggle-active', $banner->id))
            ->assertRedirect();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Shop/Home')
                ->has('banners', 1)
            );

        // 6. Delete banner
        $this->actingAs($admin)
            ->delete(route('admin.banners.destroy', $banner->id))
            ->assertRedirect(route('admin.banners.index'));

        $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
    }

    public function test_queued_banner_job_stores_image_in_imagekit(): void
    {
        Storage::fake('local');

        config([
            'services.imagekit.public_key' => 'test_public_key',
            'services.imagekit.private_key' => 'test_private_key',
            'services.imagekit.url_endpoint' => 'https://ik.imagekit.io/test',
        ]);

        Http::fake([
            'https://upload.imagekit.io/api/v1/files/upload' => Http::response([
                'fileId' => 'ik_banner_1',
                'url' => 'https://ik.imagekit.io/test/banners/promo.jpg',
                'thumbnailUrl' => 'https://ik.imagekit.io/test/tr:n-media_library_thumbnail/banners/promo.jpg',
                'filePath' => '/banners/promo.jpg',
            ], 200),
        ]);

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $this->actingAs($admin)->post(route('admin.banners.store'), [
            'cta_link' => '/catalog',
            'sort_order' => 1,
            'is_active' => true,
            'image_file' => UploadedFile::fake()->image('promo.jpg'),
        ])->assertRedirect(route('admin.banners.index'));

        $banner = Banner::latest('id')->first();
        $this->assertNotNull($banner);
        $this->assertEquals('https://ik.imagekit.io/test/banners/promo.jpg', $banner->banner_image);
    }
}


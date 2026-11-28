<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Jobs\UploadImageToImageKit;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\RetailerProfile;
use App\Models\User;
use App\Services\ImageKitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageUploadQueueTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_product_profile_and_kyc_dispatch_image_upload_jobs(): void
    {
        Queue::fake();
        Storage::fake('local');

        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $category = Category::create(['name' => 'Dairy', 'slug' => 'dairy', 'is_active' => true]);

        // 1. Category image upload dispatches job
        $this->actingAs($admin)->post('/admin/categories', [
            'name' => 'Cheese',
            'image_file' => UploadedFile::fake()->image('cheese.jpg'),
        ])->assertRedirect();

        Queue::assertPushed(UploadImageToImageKit::class, fn ($job) => $job->modelClass === Category::class && $job->folder === '/categories');

        // 2. Product image upload dispatches job
        $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Fresh Paneer',
            'brand' => 'Amul',
            'category_id' => $category->id,
            'is_active' => true,
            'variants' => [[
                'unit_size' => '200g',
                'mrp' => 100,
                'retail_price' => 90,
                'bulk_price' => 80,
                'min_bulk_qty' => 5,
                'stock' => 20,
                'sku' => 'PANEER-200G',
                'image_files' => [UploadedFile::fake()->image('paneer.jpg')],
            ]],
        ])->assertRedirect('/admin/products');

        Queue::assertPushed(UploadImageToImageKit::class, fn ($job) => $job->modelClass === ProductImage::class && $job->folder === '/products');

        // 3. Profile avatar upload dispatches job
        $customer = User::factory()->create(['phone' => '9876543210']);
        $this->actingAs($customer)->post('/profile', [
            'name' => 'Test Customer',
            'email' => $customer->email,
            'phone' => '9876543210',
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ])->assertRedirect();

        Queue::assertPushed(UploadImageToImageKit::class, fn ($job) => $job->modelClass === User::class && $job->column === 'profile_pic');

        // 4. KYC upload dispatches jobs for shop_image, aadhaar_front, aadhaar_back
        $this->actingAs($customer)->post('/apply-to-retailer', [
            'shop_name' => 'Test Mart',
            'line1' => 'Main Road',
            'city' => 'Purnia',
            'state' => 'Bihar',
            'pincode' => '854301',
            'gst_number' => '10ABCDE1234F1Z5',
            'aadhaar_card' => '123456789012',
            'shop_image' => UploadedFile::fake()->image('shop.jpg'),
            'aadhaar_front' => UploadedFile::fake()->image('front.jpg'),
            'aadhaar_back' => UploadedFile::fake()->image('back.jpg'),
        ])->assertRedirect();

        Queue::assertPushed(UploadImageToImageKit::class, fn ($job) => $job->modelClass === RetailerProfile::class && $job->column === 'shop_image');
        Queue::assertPushed(UploadImageToImageKit::class, fn ($job) => $job->modelClass === RetailerProfile::class && $job->column === 'aadhaar_card_front');
        Queue::assertPushed(UploadImageToImageKit::class, fn ($job) => $job->modelClass === RetailerProfile::class && $job->column === 'aadhaar_card_back');
    }

    public function test_upload_image_job_uploads_to_imagekit_updates_models_and_deletes_temp_file(): void
    {
        Storage::fake('local');

        config([
            'services.imagekit.public_key' => 'test_public_key',
            'services.imagekit.private_key' => 'test_private_key',
            'services.imagekit.url_endpoint' => 'https://ik.imagekit.io/test',
        ]);

        Http::fake([
            'https://upload.imagekit.io/api/v1/files/upload' => Http::response([
                'fileId' => 'ik_queued_123',
                'url' => 'https://ik.imagekit.io/test/products/queued.jpg',
                'thumbnailUrl' => 'https://ik.imagekit.io/test/tr:n-media_library_thumbnail/products/queued.jpg',
                'filePath' => '/products/queued.jpg',
            ], 200),
        ]);

        $category = Category::create(['name' => 'Milk', 'slug' => 'milk', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Cow Milk', 'slug' => 'cow-milk', 'status' => 'active']);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'variant_name' => 'Cow Milk - 1L',
            'unit_size' => '1L',
            'mrp' => 70,
            'retail_price' => 65,
            'bulk_price' => 60,
            'stock' => 10,
            'sku' => 'MILK-1L',
        ]);
        $productImage = ProductImage::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'url' => '',
            'is_primary' => true,
            'sort_order' => 0,
        ]);

        $tempPath = Storage::disk('local')->putFile('temp-uploads', UploadedFile::fake()->image('queued.jpg'));
        $this->assertTrue(Storage::disk('local')->exists($tempPath));

        $job = new UploadImageToImageKit(
            $tempPath,
            'queued.jpg',
            ProductImage::class,
            $productImage->id,
            'url',
            '/products'
        );
        $job->handle(app(ImageKitService::class));

        $this->assertFalse(Storage::disk('local')->exists($tempPath));
        $this->assertEquals('https://ik.imagekit.io/test/products/queued.jpg', $productImage->fresh()->url);
        $this->assertEquals('ik_queued_123', $productImage->fresh()->file_id);
        $this->assertEquals('https://ik.imagekit.io/test/products/queued.jpg', $variant->fresh()->image_url);
    }
}

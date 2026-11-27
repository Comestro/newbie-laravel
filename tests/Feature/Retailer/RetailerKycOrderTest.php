<?php

namespace Tests\Feature\Retailer;

use App\Enums\UserRole;
use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\RetailerProfile;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RetailerKycOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_retailer_registration_creates_account_with_pending_kyc(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Retailer',
            'email' => 'newretailer@example.com',
            'shop_name' => 'Test Retail Store',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'RETAILER',
        ]);

        $response->assertRedirect('/');

        $user = User::where('email', 'newretailer@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(UserRole::RETAILER, $user->role);
        $this->assertTrue($user->isRetailer());
        $this->assertFalse($user->isKycApproved());
        $this->assertFalse($user->canPlaceOrder());

        $profile = RetailerProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('PENDING', $profile->status);
        $this->assertEquals('Test Retail Store', $profile->shop_name);
    }

    public function test_retailer_registration_requires_shop_name(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Retailer',
            'email' => 'newretailer2@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'RETAILER',
        ]);

        $response->assertSessionHasErrors('shop_name');
    }

    public function test_retailer_gets_bulk_price_in_cart(): void
    {
        $retailer = User::create([
            'name' => 'Shop Owner',
            'email' => 'shopowner@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
            'is_member' => true,
        ]);
        RetailerProfile::create([
            'user_id' => $retailer->id,
            'shop_name' => 'Shop Owner Store',
            'status' => 'PENDING',
        ]);

        $customer = User::where('email', 'user@newbie.com')->first();

        $variant = ProductVariant::whereNotNull('bulk_price')->first();
        $this->assertNotNull($variant);
        $this->assertNotEquals($variant->retail_price, $variant->bulk_price);

        // Retailer adds to cart
        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 5,
        ]);
        $this->assertEquals($variant->bulk_price, session('cart')[$variant->id]['price']);

        // Clear cart session
        session()->forget('cart');

        // Normal customer adds to cart
        $this->actingAs($customer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 5,
        ]);
        $this->assertEquals($variant->retail_price, session('cart')[$variant->id]['price']);
    }

    public function test_retailer_cannot_place_order_when_kyc_is_pending(): void
    {
        $retailer = User::create([
            'name' => 'Shop Owner',
            'email' => 'pendingkyc@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
            'is_member' => true,
        ]);
        RetailerProfile::create([
            'user_id' => $retailer->id,
            'shop_name' => 'Pending Shop',
            'status' => 'PENDING',
        ]);

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Main Market, Shop 42',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();

        // Add to cart
        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        // Attempt order placement
        $response = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHas('error', 'Retailer KYC approval is required before you can place orders.');

        // Verify order was NOT created
        $this->assertEquals(0, Order::where('user_id', $retailer->id)->count());
    }

    public function test_retailer_cannot_place_order_when_kyc_is_rejected(): void
    {
        $retailer = User::create([
            'name' => 'Rejected Shop',
            'email' => 'rejected@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
            'is_member' => true,
        ]);
        RetailerProfile::create([
            'user_id' => $retailer->id,
            'shop_name' => 'Rejected Shop',
            'status' => 'REJECTED',
            'rejection_reason' => 'Aadhaar card image is blur and unreadable.',
        ]);

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Market Square',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();

        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHas('error', 'Retailer KYC approval is required before you can place orders.');
        $this->assertEquals(0, Order::where('user_id', $retailer->id)->count());
    }

    public function test_retailer_cannot_place_order_when_kyc_is_unsubmitted(): void
    {
        $retailer = User::create([
            'name' => 'Unsubmitted KYC Shop',
            'email' => 'unsubmitted@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
            'is_member' => true,
        ]);
        // Note: No RetailerProfile record created

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Market Square',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();

        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertRedirect('/checkout');
        $response->assertSessionHas('error', 'Retailer KYC approval is required before you can place orders.');
        $this->assertEquals(0, Order::where('user_id', $retailer->id)->count());
    }

    public function test_admin_can_approve_retailer_and_retailer_can_place_order(): void
    {
        $admin = User::where('email', 'admin@newbie.com')->first();

        $retailer = User::create([
            'name' => 'Approved Retailer',
            'email' => 'approved@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::RETAILER,
            'is_member' => true,
        ]);
        $profile = RetailerProfile::create([
            'user_id' => $retailer->id,
            'shop_name' => 'Approved Store',
            'status' => 'PENDING',
            'aadhaar_card' => '123456789012',
        ]);

        $address = Address::create([
            'user_id' => $retailer->id,
            'label' => 'Shop',
            'line1' => 'Market Square',
            'city' => 'Delhi',
            'state' => 'Delhi',
            'pincode' => '110001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        // 1. Admin approves KYC
        $approveResponse = $this->actingAs($admin)->post("/admin/review-retailer/{$retailer->id}/approve");
        $approveResponse->assertSessionHas('success');

        $profile->refresh();
        $this->assertEquals('VERIFIED', $profile->status);
        $this->assertNotNull($profile->approved_at);

        $retailer->refresh();
        $this->assertTrue($retailer->isKycApproved());
        $this->assertTrue($retailer->canPlaceOrder());

        // 2. Retailer adds item to cart & places order successfully
        $variant = ProductVariant::first();
        $this->actingAs($retailer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $orderResponse = $this->actingAs($retailer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $orderResponse->assertSessionMissing('error');
        $this->assertEquals(1, Order::where('user_id', $retailer->id)->count());

        $order = Order::where('user_id', $retailer->id)->first();
        $this->assertNotNull($order);
        $orderResponse->assertRedirect(route('ordersuccess', ['order' => $order->order_number]));
    }

    public function test_regular_customer_can_place_order_without_kyc(): void
    {
        $customer = User::where('email', 'user@newbie.com')->first();
        $this->assertTrue($customer->canPlaceOrder());

        $address = Address::where('user_id', $customer->id)->first() ?? Address::create([
            'user_id' => $customer->id,
            'label' => 'Home',
            'line1' => '123 Main St',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'pincode' => '560001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $variant = ProductVariant::first();
        $this->actingAs($customer)->post('/cart/add', [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($customer)->post('/checkout', [
            'address_id' => $address->id,
        ]);

        $response->assertSessionMissing('error');
        $this->assertDatabaseHas('orders', [
            'user_id' => $customer->id,
        ]);
    }

    public function test_submitting_retailer_kyc_requires_shop_name(): void
    {
        $customer = User::create([
            'name' => 'KYC Applicant',
            'email' => 'applicant@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::USER,
        ]);

        $response = $this->actingAs($customer)->post('/apply-to-retailer', [
            'aadhaar_card' => '123456789012',
            // shop_name omitted
        ]);

        $response->assertSessionHasErrors('shop_name');
    }

    public function test_submitting_retailer_kyc_requires_shop_address(): void
    {
        $customer = User::create([
            'name' => 'KYC Applicant',
            'email' => 'applicant2@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::USER,
        ]);

        $response = $this->actingAs($customer)->post('/apply-to-retailer', [
            'shop_name' => 'Demo Shop',
            'aadhaar_card' => '123456789012',
            // address and gst_number omitted
        ]);

        $response->assertSessionHasErrors(['line1', 'city', 'state', 'pincode', 'gst_number']);
    }

    public function test_submitting_retailer_kyc_successfully_saves_all_fields_and_syncs_address(): void
    {
        Storage::fake('public');

        $customer = User::create([
            'name' => 'Store Owner',
            'email' => 'storeowner@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::USER,
        ]);

        $response = $this->actingAs($customer)->post('/apply-to-retailer', [
            'shop_name' => 'Supreme Kirana Store',
            'line1' => 'Shop 10, Crystal Palm Market',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'gst_number' => '08aabcs1429b1z1',
            'shop_image' => UploadedFile::fake()->image('shop.jpg'),
            'aadhaar_card' => '123456789012',
            'aadhaar_front' => UploadedFile::fake()->image('front.jpg'),
            'aadhaar_back' => UploadedFile::fake()->image('back.jpg'),
            'sync_delivery_address' => 1,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $profile = RetailerProfile::where('user_id', $customer->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('Supreme Kirana Store', $profile->shop_name);
        $this->assertEquals('Shop 10, Crystal Palm Market, Jaipur, Rajasthan - 302001', $profile->shop_address);
        $this->assertEquals('08AABCS1429B1Z1', $profile->gst_number);
        $this->assertNotNull($profile->shop_image);
        $this->assertNotNull($profile->aadhaar_card_front);
        $this->assertNotNull($profile->aadhaar_card_back);
        $this->assertEquals('PENDING', $profile->status);

        // Verify delivery address was auto-synced
        $address = Address::where('user_id', $customer->id)->where('label', 'Shop')->first();
        $this->assertNotNull($address);
        $this->assertStringContainsString('Shop 10, Crystal Palm Market', $address->line1);
    }

    public function test_submitting_retailer_kyc_with_structured_address_fields(): void
    {
        Storage::fake('public');

        $customer = User::create([
            'name' => 'Structured Shop Owner',
            'email' => 'structured@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::USER,
        ]);

        $response = $this->actingAs($customer)->post('/apply-to-retailer', [
            'shop_name' => 'Modern Retail Hub',
            'line1' => 'Shop 24, Gold Souk Mall',
            'line2' => 'Near Central Park',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302005',
            'gst_number' => '08AABCS1429B1Z1',
            'shop_image' => UploadedFile::fake()->image('shop.jpg'),
            'aadhaar_card' => '123456789012',
            'aadhaar_front' => UploadedFile::fake()->image('front.jpg'),
            'aadhaar_back' => UploadedFile::fake()->image('back.jpg'),
            'sync_delivery_address' => 1,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $profile = RetailerProfile::where('user_id', $customer->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('Modern Retail Hub', $profile->shop_name);
        $this->assertEquals('Shop 24, Gold Souk Mall, Near Central Park, Jaipur, Rajasthan - 302005', $profile->shop_address);

        $address = Address::where('user_id', $customer->id)->where('label', 'Shop')->first();
        $this->assertNotNull($address);
        $this->assertEquals('Shop 24, Gold Souk Mall', $address->line1);
        $this->assertEquals('Near Central Park', $address->line2);
        $this->assertEquals('Jaipur', $address->city);
        $this->assertEquals('Rajasthan', $address->state);
        $this->assertEquals('302005', $address->pincode);
    }

    public function test_submitting_retailer_kyc_requires_gst_number(): void
    {
        $customer = User::create([
            'name' => 'KYC Applicant',
            'email' => 'applicant-gst@example.com',
            'password' => bcrypt('password'),
            'role' => UserRole::USER,
        ]);

        $response = $this->actingAs($customer)->post('/apply-to-retailer', [
            'shop_name' => 'Demo Shop',
            'line1' => 'Street 1',
            'city' => 'Jaipur',
            'state' => 'Rajasthan',
            'pincode' => '302001',
            'aadhaar_card' => '123456789012',
            // gst_number omitted
        ]);

        $response->assertSessionHasErrors('gst_number');
    }
}

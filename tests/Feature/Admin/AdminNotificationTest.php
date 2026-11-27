<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use App\Notifications\NewOrderReceivedNotification;
use App\Notifications\NewUserRegisteredNotification;
use App\Notifications\OrderUpdatedNotification;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::where('email', 'admin@newbie.com')->first();
        $this->customer = User::where('email', 'user@newbie.com')->first();
    }

    public function test_customer_and_retailer_registration_send_notifications_to_admin(): void
    {
        Notification::fake();

        // 1. Customer registers
        $this->post('/register', [
            'name' => 'Amit Customer',
            'email' => 'amit@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'USER',
        ])->assertRedirect('/');

        Notification::assertSentTo(
            $this->admin,
            NewUserRegisteredNotification::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && $notification->user->email === 'amit@example.com'
                && $notification->shopName === null
        );

        // 2. Logout customer, then Retailer registers
        auth()->logout();

        $this->post('/register', [
            'name' => 'Ramesh Trader',
            'email' => 'ramesh@example.com',
            'shop_name' => 'Ramesh Kirana Store',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'RETAILER',
        ])->assertRedirect('/');

        Notification::assertSentTo(
            $this->admin,
            NewUserRegisteredNotification::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && $notification->shopName === 'Ramesh Kirana Store'
        );
    }

    public function test_notifications_are_stored_in_database_and_can_be_marked_as_read(): void
    {
        config()->set('broadcasting.default', 'null');

        $this->post('/register', [
            'name' => 'Suresh Mart',
            'email' => 'suresh@example.com',
            'shop_name' => 'Suresh Super Mart',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'RETAILER',
        ]);

        $this->assertEquals(1, $this->admin->fresh()->unreadNotifications()->count());

        $notification = $this->admin->notifications()->first();
        $this->assertEquals('Suresh Super Mart', $notification->data['shop_name']);

        $this->actingAs($this->admin)
            ->get(route('admin.dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('notifications.unread_count', 1)
                ->has('notifications.items', 1)
            );

        $this->actingAs($this->admin)
            ->post(route('notifications.read', $notification->id))
            ->assertRedirect();

        $this->assertEquals(0, $this->admin->fresh()->unreadNotifications()->count());
    }

    public function test_placing_new_order_notifies_admin(): void
    {
        Notification::fake();
        $this->customer->update(['is_member' => true]);

        $variant = ProductVariant::with('product')->first();
        $address = Address::create([
            'user_id' => $this->customer->id,
            'label' => 'Home',
            'line1' => '123 Main St',
            'city' => 'Patna',
            'state' => 'Bihar',
            'pincode' => '800001',
            'phone' => '9876543210',
            'is_default' => true,
        ]);

        $this->actingAs($this->customer)
            ->withSession([
                'cart' => [
                    $variant->id => [
                        'id' => $variant->id,
                        'product_id' => $variant->product_id,
                        'name' => $variant->product->name,
                        'unit_size' => $variant->unit_size,
                        'price' => $variant->mrp,
                        'quantity' => 1,
                    ],
                ],
            ])
            ->post(route('checkout.place-order'), [
                'address_id' => $address->id,
                'payment_method' => 'COD',
            ])
            ->assertRedirect();

        Notification::assertSentTo(
            $this->admin,
            NewOrderReceivedNotification::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && $notification->customer->id === $this->customer->id
        );
    }

    public function test_admin_order_edit_and_status_updates_notify_customer(): void
    {
        Notification::fake();

        $variant = ProductVariant::with('product')->first();
        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'NB99887766',
            'subtotal' => 100,
            'discount' => 0,
            'delivery_fee' => 0,
            'total_amount' => 100,
            'status' => OrderStatus::PENDING,
            'payment_status' => PaymentStatus::PENDING,
            'payment_method' => PaymentMethod::COD,
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $variant->product_id,
            'variant_id' => $variant->id,
            'product_name' => $variant->product->name,
            'variant_name' => $variant->unit_size,
            'quantity' => 1,
            'price' => 100,
            'total' => 100,
        ]);

        // 1. Admin edits order
        $this->actingAs($this->admin)
            ->put(route('admin.orders.update', $order), [
                'items' => [['id' => $item->id, 'quantity' => 2]],
                'admin_notes' => 'Adjusted quantity',
            ])
            ->assertRedirect();

        Notification::assertSentTo(
            $this->customer,
            OrderUpdatedNotification::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && $notification->event === 'edited'
                && $notification->order->id === $order->id
        );

        // 2. Admin changes order status
        $this->actingAs($this->admin)
            ->post(route('admin.orders.status', $order), [
                'status' => OrderStatus::CONFIRMED->value,
            ])
            ->assertRedirect();

        Notification::assertSentTo(
            $this->customer,
            OrderUpdatedNotification::class,
            fn ($notification) => $notification->event === 'status_changed'
                && $notification->order->status === OrderStatus::CONFIRMED
        );

        // 3. Admin changes payment status
        $this->actingAs($this->admin)
            ->post(route('admin.orders.payment-status', $order), [
                'payment_status' => PaymentStatus::PAID->value,
            ])
            ->assertRedirect();

        Notification::assertSentTo(
            $this->customer,
            OrderUpdatedNotification::class,
            fn ($notification) => $notification->event === 'payment_status_changed'
        );
    }

    public function test_guest_cannot_mark_notifications_read(): void
    {
        $this->post(route('notifications.read-all'))
            ->assertRedirect('/login');
    }
}

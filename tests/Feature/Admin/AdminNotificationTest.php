<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Notifications\NewUserRegisteredNotification;
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

    public function test_admin_notifications_are_stored_in_database_and_can_be_marked_as_read(): void
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
                ->where('adminNotifications.unread_count', 1)
                ->has('adminNotifications.items', 1)
            );

        $this->actingAs($this->admin)
            ->post(route('admin.notifications.read', $notification->id))
            ->assertRedirect();

        $this->assertEquals(0, $this->admin->fresh()->unreadNotifications()->count());
    }

    public function test_non_admin_cannot_mark_admin_notifications_read(): void
    {
        $this->actingAs($this->customer)
            ->post(route('admin.notifications.read-all'))
            ->assertForbidden();
    }
}

<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderTest extends TestCase
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

    private function createSampleOrder(OrderStatus $status = OrderStatus::PENDING): Order
    {
        $variants = ProductVariant::with('product')->take(2)->get();

        $order = Order::create([
            'user_id' => $this->customer->id,
            'order_number' => 'NB' . rand(10000000, 99999999),
            'subtotal' => 200,
            'discount' => 0,
            'delivery_fee' => 15,
            'total_amount' => 215,
            'status' => $status,
            'payment_status' => PaymentStatus::PENDING,
            'payment_method' => PaymentMethod::COD,
        ]);

        foreach ($variants as $variant) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $variant->product_id,
                'variant_id' => $variant->id,
                'product_name' => $variant->product->name,
                'variant_name' => $variant->unit_size,
                'quantity' => 2,
                'price' => 50,
                'total' => 100,
            ]);
        }

        return $order->load('items');
    }

    public function test_admin_can_edit_pending_order_quantities_and_remove_items(): void
    {
        $order = $this->createSampleOrder(OrderStatus::PENDING);
        $firstItem = $order->items->first();

        // Update first item quantity to 3 and remove second item
        $response = $this->actingAs($this->admin)->put(route('admin.orders.update', $order), [
            'items' => [
                ['id' => $firstItem->id, 'quantity' => 3],
            ],
            'admin_notes' => 'Removed out-of-stock item, updated qty.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Order updated successfully.');

        $order->refresh();
        $this->assertCount(1, $order->items);
        $this->assertEquals(3, $order->items->first()->quantity);
        $this->assertEquals(150.00, (float) $order->items->first()->total);
        $this->assertEquals(150.00, (float) $order->subtotal);
        $this->assertEquals(165.00, (float) $order->total_amount); // 150 + 15 delivery
        $this->assertEquals('Removed out-of-stock item, updated qty.', $order->admin_notes);
    }

    public function test_admin_can_confirm_order_and_sets_confirmed_at(): void
    {
        $order = $this->createSampleOrder(OrderStatus::PENDING);

        $response = $this->actingAs($this->admin)->post(route('admin.orders.status', $order), [
            'status' => OrderStatus::CONFIRMED->value,
        ]);

        $response->assertRedirect();
        $order->refresh();

        $this->assertEquals(OrderStatus::CONFIRMED, $order->status);
        $this->assertNotNull($order->confirmed_at);
    }

    public function test_admin_cannot_edit_delivered_or_cancelled_orders(): void
    {
        $order = $this->createSampleOrder(OrderStatus::DELIVERED);
        $firstItem = $order->items->first();

        $response = $this->actingAs($this->admin)->put(route('admin.orders.update', $order), [
            'items' => [
                ['id' => $firstItem->id, 'quantity' => 5],
            ],
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals(2, $firstItem->fresh()->quantity);
    }

    public function test_non_admin_cannot_edit_order(): void
    {
        $order = $this->createSampleOrder(OrderStatus::PENDING);
        $firstItem = $order->items->first();

        $response = $this->actingAs($this->customer)->put(route('admin.orders.update', $order), [
            'items' => [
                ['id' => $firstItem->id, 'quantity' => 5],
            ],
        ]);

        $response->assertForbidden();
    }

    public function test_order_placement_edit_and_cancellation_update_variant_stock(): void
    {
        $variant = ProductVariant::with('product')->first();
        $initialStock = $variant->stock;

        $address = \App\Models\Address::create([
            'user_id' => $this->customer->id,
            'label' => 'Home',
            'line1' => '123 Main St',
            'city' => 'Patna',
            'state' => 'Bihar',
            'pincode' => '800001',
            'phone' => '9876543210',
        ]);

        // 1. Place order for 4 units -> stock decreases by 4
        $this->actingAs($this->customer)
            ->withSession([
                'cart' => [
                    $variant->id => [
                        'id' => $variant->id,
                        'product_id' => $variant->product_id,
                        'name' => $variant->product->name,
                        'unit_size' => $variant->unit_size,
                        'price' => $variant->retail_price,
                        'quantity' => 4,
                    ],
                ],
            ])
            ->post(route('checkout.place-order'), ['address_id' => $address->id])
            ->assertRedirect();

        $this->assertEquals($initialStock - 4, $variant->fresh()->stock);

        $order = Order::latest('id')->first();
        $item = $order->items->first();

        // 2. Admin reduces qty from 4 to 2 -> stock restores by 2
        $this->actingAs($this->admin)->put(route('admin.orders.update', $order), [
            'items' => [['id' => $item->id, 'quantity' => 2]],
        ]);
        $this->assertEquals($initialStock - 2, $variant->fresh()->stock);

        // 3. Admin cancels order -> remaining 2 units restored to initialStock
        $this->actingAs($this->admin)->post(route('admin.orders.status', $order), [
            'status' => OrderStatus::CANCELLED->value,
        ]);
        $this->assertEquals($initialStock, $variant->fresh()->stock);
    }
}


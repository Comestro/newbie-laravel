<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $orders = Order::with('user')
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($search, function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'statuses' => OrderStatus::cases(),
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items.variant.product', 'address', 'user']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'statuses' => OrderStatus::cases(),
            'paymentStatuses' => PaymentStatus::cases(),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        if (in_array($order->status, [OrderStatus::SHIPPED, OrderStatus::DELIVERED, OrderStatus::CANCELLED], true)) {
            return back()->with('error', 'Shipped, delivered, or cancelled orders cannot be edited.');
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer|exists:order_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($order, $validated) {
            $existingItems = $order->items()->get()->keyBy('id');
            $submittedIds = collect($validated['items'])->pluck('id')->all();

            $order->items()->whereNotIn('id', $submittedIds)->delete();

            foreach ($validated['items'] as $itemData) {
                $item = $existingItems->get($itemData['id']);
                if ($item) {
                    $qty = (int) $itemData['quantity'];
                    $item->update([
                        'quantity' => $qty,
                        'total' => $item->price * $qty,
                    ]);
                }
            }

            $subtotal = (float) $order->items()->sum('total');
            $totalAmount = max(0, $subtotal - (float) $order->discount + (float) $order->delivery_fee);

            $adminNotes = array_key_exists('admin_notes', $validated)
                ? (filled($validated['admin_notes']) ? Str::ucfirst(trim($validated['admin_notes'])) : null)
                : $order->admin_notes;

            $order->update([
                'subtotal' => $subtotal,
                'total_amount' => $totalAmount,
                'admin_notes' => $adminNotes,
            ]);
        });

        return back()->with('success', 'Order updated successfully.');
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $newStatus = OrderStatus::from($request->input('status'));
        $data = ['status' => $newStatus];

        match ($newStatus) {
            OrderStatus::CONFIRMED => $data['confirmed_at'] = $order->confirmed_at ?? now(),
            OrderStatus::SHIPPED => $data['shipped_at'] = $order->shipped_at ?? now(),
            OrderStatus::DELIVERED => $data['delivered_at'] = $order->delivered_at ?? now(),
            OrderStatus::CANCELLED => $data['cancelled_at'] = $order->cancelled_at ?? now(),
            default => null,
        };

        $order->update($data);

        return back()->with('success', 'Order status updated successfully.');
    }

    public function updatePaymentStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'payment_status' => 'required',
        ]);

        $order->update(['payment_status' => $request->input('payment_status')]);

        return back()->with('success', 'Payment status updated successfully.');
    }
}


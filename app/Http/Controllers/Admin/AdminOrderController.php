<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\LoyaltyTransaction;
use App\Models\Order;
use App\Notifications\OrderUpdatedNotification;
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

        $orders = Order::with(['user', 'invoice'])
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
        $order->load(['items.variant.product', 'address', 'user', 'payments', 'invoice']);

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
            $existingItems = $order->items()->with('variant')->get()->keyBy('id');
            $submittedIds = collect($validated['items'])->pluck('id')->all();

            // Restore stock for removed items
            foreach ($existingItems->whereNotIn('id', $submittedIds) as $removedItem) {
                $removedItem->variant?->increment('stock', $removedItem->quantity);
            }
            $order->items()->whereNotIn('id', $submittedIds)->delete();

            // Adjust stock for updated quantities
            foreach ($validated['items'] as $itemData) {
                $item = $existingItems->get($itemData['id']);
                if ($item) {
                    $qty = (int) $itemData['quantity'];
                    $diff = $qty - $item->quantity;

                    if ($diff > 0 && $item->variant) {
                        $item->variant->decrement('stock', min($diff, $item->variant->stock));
                    } elseif ($diff < 0 && $item->variant) {
                        $item->variant->increment('stock', abs($diff));
                    }

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

        $order->user?->notifySafely(new OrderUpdatedNotification($order->fresh(), 'edited'));

        return back()->with('success', 'Order updated successfully.');
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $newStatus = OrderStatus::from($request->input('status'));
        $previousStatus = $order->status;
        $data = ['status' => $newStatus];

        match ($newStatus) {
            OrderStatus::CONFIRMED => $data['confirmed_at'] = $order->confirmed_at ?? now(),
            OrderStatus::SHIPPED => $data['shipped_at'] = $order->shipped_at ?? now(),
            OrderStatus::DELIVERED => $data['delivered_at'] = $order->delivered_at ?? now(),
            OrderStatus::CANCELLED => $data['cancelled_at'] = $order->cancelled_at ?? now(),
            default => null,
        };

        DB::transaction(function () use ($order, $data, $previousStatus, $newStatus) {
            if ($previousStatus !== OrderStatus::CANCELLED && $newStatus === OrderStatus::CANCELLED) {
                foreach ($order->items()->with('variant')->get() as $item) {
                    $item->variant?->increment('stock', $item->quantity);
                }

                if ($order->points_used > 0 && $order->user) {
                    $order->user->increment('loyalty_points', $order->points_used);
                    LoyaltyTransaction::create([
                        'user_id' => $order->user_id,
                        'type' => 'ORDER_REFUND',
                        'points' => $order->points_used,
                        'amount' => $order->discount,
                        'description' => "Refunded from cancelled Order #{$order->order_number}",
                        'order_id' => $order->id,
                    ]);
                }
            } elseif ($previousStatus === OrderStatus::CANCELLED && $newStatus !== OrderStatus::CANCELLED) {
                foreach ($order->items()->with('variant')->get() as $item) {
                    if ($item->variant) {
                        $item->variant->decrement('stock', min($item->quantity, $item->variant->stock));
                    }
                }
            }

            $order->update($data);
        });

        if ($previousStatus !== $newStatus) {
            $order->user?->notifySafely(
                new OrderUpdatedNotification($order->fresh(), 'status_changed', $previousStatus?->value)
            );
        }

        return back()->with('success', 'Order status updated successfully.');
    }

    public function updatePaymentStatus(Request $request, Order $order): RedirectResponse
    {
        $request->validate([
            'payment_status' => 'required',
        ]);

        $newPaymentStatus = $request->input('payment_status');
        $order->update(['payment_status' => $newPaymentStatus]);

        if ($latestPayment = $order->latestPayment) {
            $latestPayment->update([
                'status' => $newPaymentStatus,
                'paid_at' => $newPaymentStatus === PaymentStatus::PAID->value ? ($latestPayment->paid_at ?? now()) : $latestPayment->paid_at,
            ]);
        }

        $order->user?->notifySafely(new OrderUpdatedNotification($order->fresh(), 'payment_status_changed'));

        return back()->with('success', 'Payment status updated successfully.');
    }

    public function generateInvoice(Order $order): RedirectResponse
    {
        $isRegenerate = $order->invoice()->exists();
        $invoice = Invoice::generateFromOrder($order);

        $order->user?->notifySafely(new OrderUpdatedNotification($order->fresh('invoice'), 'invoice_generated'));

        $message = $isRegenerate
            ? "Invoice {$invoice->invoice_number} regenerated successfully."
            : "Invoice {$invoice->invoice_number} generated successfully.";

        return back()->with('success', $message);
    }

    public function invoice(Order $order): Response
    {
        $order->load('invoice');
        abort_unless($order->invoice, 404);

        return Inertia::render('Invoices/Show', [
            'invoice' => $order->invoice,
        ]);
    }
}


<?php

namespace App\Http\Controllers;

use App\Models\LoyaltyTransaction;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LoyaltyController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('Customer/Loyalty', [
            'config' => Setting::getLoyaltyConfig(),
            'transactions' => $user->loyaltyTransactions()->latest()->take(25)->get(),
            'pendingPoints' => (int) $user->loyaltyTransactions()->where('type', 'ORDER_EARN_PENDING')->sum('points'),
        ]);
    }

    public function createMembershipOrder(): JsonResponse
    {
        $user = Auth::user();
        if ($user->is_member) {
            return response()->json(['message' => 'Membership is already active.'], 422);
        }

        $config = Setting::getLoyaltyConfig();
        $fee = (float) $config['membership_fee'];

        if ($fee <= 0) {
            $this->activateMembershipForUser($user->id, $config, null, null);
            return response()->json(['activated' => true]);
        }

        return $this->createRazorpayOrderResponse($fee, 'mem_' . Str::random(10));
    }

    public function verifyMembership(Request $request): RedirectResponse
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        if (!$this->verifySignature(
            $request->input('razorpay_order_id'),
            $request->input('razorpay_payment_id'),
            $request->input('razorpay_signature')
        )) {
            return back()->with('error', 'Membership payment verification failed.');
        }

        $config = Setting::getLoyaltyConfig();
        $this->activateMembershipForUser(
            Auth::id(),
            $config,
            $request->input('razorpay_order_id'),
            $request->input('razorpay_payment_id')
        );

        return back()->with('success', "Membership activated! {$config['membership_bonus_points']} loyalty points added.");
    }

    public function createTopupOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:50000',
        ]);

        return $this->createRazorpayOrderResponse((float) $validated['amount'], 'topup_' . Str::random(10));
    }

    public function verifyTopup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:50000',
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        if (!$this->verifySignature(
            $validated['razorpay_order_id'],
            $validated['razorpay_payment_id'],
            $validated['razorpay_signature']
        )) {
            return back()->with('error', 'Top-up payment verification failed.');
        }

        $config = Setting::getLoyaltyConfig();
        $amount = (float) $validated['amount'];
        $points = (int) round($amount * $config['points_per_rupee']);

        DB::transaction(function () use ($amount, $points, $validated) {
            $user = User::where('id', Auth::id())->lockForUpdate()->firstOrFail();
            $user->increment('loyalty_points', $points);

            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'type' => 'TOPUP',
                'points' => $points,
                'amount' => $amount,
                'description' => "Direct wallet top-up of ₹{$amount}",
                'gateway_order_id' => $validated['razorpay_order_id'],
                'gateway_payment_id' => $validated['razorpay_payment_id'],
            ]);
        });

        return back()->with('success', "{$points} loyalty points added to your wallet!");
    }

    private function activateMembershipForUser(int $userId, array $config, ?string $orderId, ?string $paymentId): void
    {
        DB::transaction(function () use ($userId, $config, $orderId, $paymentId) {
            $user = User::where('id', $userId)->lockForUpdate()->firstOrFail();
            if ($user->is_member) {
                return;
            }

            $bonusPoints = (int) $config['membership_bonus_points'];

            $user->update([
                'is_member' => true,
                'membership_paid_at' => now(),
                'loyalty_points' => $user->loyalty_points + $bonusPoints,
            ]);

            LoyaltyTransaction::create([
                'user_id' => $user->id,
                'type' => 'MEMBERSHIP',
                'points' => $bonusPoints,
                'amount' => $config['membership_fee'],
                'description' => 'Membership plan activation bonus',
                'gateway_order_id' => $orderId,
                'gateway_payment_id' => $paymentId,
            ]);
        });
    }

    private function createRazorpayOrderResponse(float $amountInRupees, string $receipt): JsonResponse
    {
        $amountInPaise = (int) round($amountInRupees * 100);
        $key = config('services.razorpay.key');
        $secret = config('services.razorpay.secret');

        $response = Http::withBasicAuth($key, $secret)
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => $amountInPaise,
                'currency' => 'INR',
                'receipt' => $receipt,
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => $response->json('error.description') ?? 'Unable to initiate Razorpay payment.',
            ], 502);
        }

        return response()->json([
            'order_id' => $response->json('id'),
            'amount' => $response->json('amount'),
            'currency' => $response->json('currency', 'INR'),
            'key' => $key,
        ]);
    }

    private function verifySignature(string $orderId, string $paymentId, string $signature): bool
    {
        $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, config('services.razorpay.secret'));
        return hash_equals($expected, $signature);
    }
}


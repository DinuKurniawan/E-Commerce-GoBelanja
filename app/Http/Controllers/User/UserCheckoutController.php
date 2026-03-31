<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmationMail;
use App\Services\FlashSaleService;
use App\Services\PromotionService;
use App\Services\RajaOngkirService;
use App\Services\StockService;
use App\Services\DeliveryScheduleService;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Promotion;
use App\Models\StoreSetting;
use App\Models\UserAddress;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserCheckoutController extends Controller
{
    public function __construct(
        private RajaOngkirService $raja,
        private StockService $stockService,
        private FlashSaleService $flashSaleService,
        private PromotionService $promotionService,
        private \App\Services\DeliveryScheduleService $scheduleService
    ) {}

    public function index(): Response
    {
        $cartItems = CartItem::query()
            ->where('user_id', auth()->id())
            ->with('product:id,name,slug,price,stock,weight,emoji')
            ->get()
            ->map(function ($item) {
                $product = $item->product;
                $flashSale = $this->flashSaleService->getActiveFlashSaleForProduct($product);

                return [
                    'id' => $item->id,
                    'product' => $product,
                    'quantity' => $item->quantity,
                    'size' => $item->size,
                    'flash_sale' => $flashSale ? [
                        'id' => $flashSale->id,
                        'flash_price' => $flashSale->flash_price,
                        'discount_percent' => $flashSale->discount_percent,
                    ] : null,
                ];
            });

        $addresses = UserAddress::query()
            ->where('user_id', auth()->id())
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        $updatedAddressIds = [];
        foreach ($addresses as $address) {
            if (! empty($address->rajaongkir_city_id) || empty($address->city_name) || empty($address->province_name)) {
                continue;
            }
            $cityId = $this->resolveRajaOngkirCityId($address->province_name, $address->city_name);
            if (! $cityId) {
                continue;
            }
            $address->rajaongkir_city_id = $cityId;
            $address->save();
            $updatedAddressIds[] = $address->id;
        }

        if (! empty($updatedAddressIds)) {
            $addresses = UserAddress::query()
                ->where('user_id', auth()->id())
                ->orderByDesc('is_default')
                ->latest()
                ->get();
        }

        $subtotal = (int) $cartItems->sum(function ($item) {
            $price = $item['flash_sale'] ? $item['flash_sale']['flash_price'] : $item['product']->price;
            return $price * $item['quantity'];
        });

        $totalWeight = (int) $cartItems->sum(fn ($item) => ($item['product']->weight ?? 500) * $item['quantity']);

        $setting = StoreSetting::query()->first();
        $paymentMethods = collect(explode(',', $setting?->payment_method ?? ''))
            ->map(fn ($m) => trim($m))
            ->filter()
            ->values()
            ->all();

        if (empty($paymentMethods)) {
            $paymentMethods = ['Transfer Bank'];
        }

        $bankAccounts = $setting?->bank_accounts ?? [];

        // Get available promotions
        $availablePromotions = [];
        if ($cartItems->isNotEmpty()) {
            $availablePromotions = $this->promotionService
                ->getAvailablePromotions($cartItems, auth()->user())
                ->map(function ($promo) use ($cartItems) {
                    $discount = $this->promotionService->calculateDiscount($promo, $cartItems, auth()->user());
                    return [
                        'id' => $promo->id,
                        'code' => $promo->code,
                        'name' => $promo->name,
                        'description' => $promo->description,
                        'promotion_type' => $promo->promotion_type,
                        'discount_amount' => $discount['discount_amount'],
                        'free_shipping' => $discount['free_shipping'] ?? false,
                    ];
                })->toArray();
        }

        return Inertia::render('User/Checkout', [
            'cartItems'           => $cartItems,
            'addresses'           => $addresses,
            'subtotal'            => $subtotal,
            'totalWeight'         => max($totalWeight, 1000),
            'originCityId'        => config('rajaongkir.origin_city_id'),
            'paymentMethods'      => $paymentMethods,
            'bankAccounts'        => $bankAccounts,
            'availablePromotions' => $availablePromotions,
        ]);
    }

    public function store(): RedirectResponse
    {
        $validated = request()->validate([
            'address_id'       => 'required|exists:user_addresses,id',
            'courier'          => 'required|string|in:jne,pos,tiki,sicepat,jnt',
            'service'          => 'required|string|max:20',
            'service_label'    => 'required|string|max:200',
            'shipping_cost'    => 'required|integer|min:0',
            'estimated_delivery' => 'nullable|string|max:50',
            'has_insurance'    => 'boolean',
            'insurance_cost'   => 'integer|min:0',
            'payment_method'   => 'required|string|max:100',
            'notes'            => 'nullable|string|max:1000',
            'promotion_code'   => 'nullable|string|max:255',
            'delivery_date'    => 'required|date',
            'time_slot'        => 'required|string|max:50',
            'is_same_day'      => 'boolean',
            'special_instructions' => 'nullable|string|max:200',
        ]);

        $userId  = auth()->id();
        $address = UserAddress::query()
            ->where('user_id', $userId)
            ->findOrFail($validated['address_id']);

        $cartItems = CartItem::query()
            ->where('user_id', $userId)
            ->with('product:id,name,price,stock,category_id')
            ->get();

        if ($cartItems->isEmpty()) {
            return back()->withErrors(['cart' => 'Keranjang kosong, tidak bisa checkout.']);
        }

        // Validate delivery schedule
        $scheduleValidation = $this->scheduleService->validateSchedule(
            $validated['delivery_date'],
            $validated['time_slot'],
            $validated['is_same_day'] ?? false
        );

        if (!$scheduleValidation['valid']) {
            return back()->withErrors(['delivery_schedule' => $scheduleValidation['error']]);
        }

        // Validate promotion code if provided
        $promotion = null;
        $discountData = null;
        if (!empty($validated['promotion_code'])) {
            $promoValidation = $this->promotionService->validatePromoCode(
                $validated['promotion_code'],
                $cartItems,
                auth()->user()
            );

            if (!$promoValidation['valid']) {
                return back()->withErrors(['promotion_code' => $promoValidation['message']]);
            }

            $promotion = $promoValidation['promotion'];
            $discountData = $promoValidation['discount'];
        }

        DB::transaction(function () use ($userId, $address, $validated, $cartItems, $promotion, $discountData) {
            $itemSubtotal = 0;

            // Check stock and flash sale availability
            foreach ($cartItems as $item) {
                $product = $item->product;
                if (! $product || $product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => 'Stok produk tidak mencukupi saat checkout.',
                    ]);
                }

                $flashSale = $this->flashSaleService->getActiveFlashSaleForProduct($product);
                if ($flashSale) {
                    $availability = $this->flashSaleService->checkFlashSaleAvailability($flashSale, $item->quantity);
                    if (!$availability['available']) {
                        throw ValidationException::withMessages([
                            'cart' => $availability['reason'],
                        ]);
                    }
                    $price = $flashSale->flash_price;
                } else {
                    $price = $product->price;
                }

                $itemSubtotal += $price * $item->quantity;
            }

            $courierLabel = strtoupper($validated['courier']) . ' ' . $validated['service'];
            
            // Calculate insurance if opted in
            $hasInsurance = $validated['has_insurance'] ?? false;
            $insuranceCost = 0;
            if ($hasInsurance) {
                $rate = 0.005; // 0.5%
                $insurance = $itemSubtotal * $rate;
                $insuranceCost = max($insurance, 5000); // minimum Rp 5,000
            }
            
            // Apply discount if promotion exists
            $discountAmount = 0;
            $appliedPromotions = [];
            $freeShippingApplied = false;

            if ($promotion && $discountData) {
                $discountAmount = $discountData['discount_amount'];
                $freeShippingApplied = $discountData['free_shipping'] ?? false;
                $appliedPromotions[] = [
                    'promotion_id' => $promotion->id,
                    'code' => $promotion->code,
                    'name' => $promotion->name,
                    'type' => $promotion->promotion_type,
                    'discount_amount' => $discountAmount,
                ];
            }

            $shippingCost = $freeShippingApplied ? 0 : (int) $validated['shipping_cost'];
            
            // Add same-day delivery fee if applicable
            $sameDayFee = ($validated['is_same_day'] ?? false) ? $this->scheduleService->calculateSameDayFee() : 0;
            $totalAmount = $itemSubtotal - $discountAmount + $shippingCost + $insuranceCost + $sameDayFee;
            $orderNumber = 'INV-GB-' . now()->format('YmdHis') . '-' . $userId;

            $addressParts = array_filter([
                $address->full_address,
                $address->village_name,
                $address->district_name,
                $address->city_name,
                $address->province_name,
                $address->postal_code,
            ]);

            $order = Order::query()->create([
                'user_id'                  => $userId,
                'promotion_id'             => $promotion?->id,
                'promotion_code'           => $promotion?->code,
                'order_number'             => $orderNumber,
                'subtotal_before_discount' => $itemSubtotal,
                'discount_amount'          => $discountAmount,
                'total_amount'             => $totalAmount,
                'applied_promotions'       => $appliedPromotions,
                'free_shipping_applied'    => $freeShippingApplied,
                'status'                   => 'pending',
                'shipping_courier'         => $courierLabel . ' — ' . $validated['service_label'],
                'courier_code'             => $validated['courier'],
                'courier_service'          => $validated['service'],
                'shipping_cost'            => $shippingCost,
                'has_insurance'            => $hasInsurance,
                'insurance_cost'           => $insuranceCost,
                'estimated_delivery'       => $validated['estimated_delivery'] ?? null,
                'tracking_number'          => null,
                'shipping_address'         => "{$address->label} — {$address->recipient_name} ({$address->phone}) | " . implode(', ', $addressParts),
                'payment_status'           => 'pending',
                'notes'                    => $validated['notes'] ?? null,
            ]);

            foreach ($cartItems as $item) {
                $product  = $item->product;
                
                // Get flash sale price if active
                $flashSale = $this->flashSaleService->getActiveFlashSaleForProduct($product);
                $unitPrice = $flashSale ? $flashSale->flash_price : $product->price;
                $subtotal = $unitPrice * $item->quantity;

                OrderItem::query()->create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal'   => $subtotal,
                ]);

                // Use StockService to decrement stock with proper tracking
                $this->stockService->decrementForSale($product, $item->quantity, $order->id);

                // Increment flash sale sold quantity
                if ($flashSale) {
                    $this->flashSaleService->incrementSoldQuantity($flashSale, $item->quantity);
                }
            }

            // Record promotion usage
            if ($promotion && $discountAmount > 0) {
                $this->promotionService->recordPromotionUsage($promotion, $order, $discountAmount);
            }

            Payment::query()->create([
                'order_id'    => $order->id,
                'method'      => $validated['payment_method'],
                'status'      => 'pending',
                'proof_image' => null,
                'amount'      => $totalAmount,
                'paid_at'     => null,
            ]);

            // Create delivery schedule
            $order->deliverySchedule()->create([
                'delivery_date' => $validated['delivery_date'],
                'time_slot' => $validated['time_slot'],
                'is_same_day' => $validated['is_same_day'] ?? false,
                'special_instructions' => $validated['special_instructions'] ?? null,
                'status' => 'scheduled',
            ]);

            $notificationMessage = "Pesanan {$order->order_number} berhasil dibuat dan menunggu pembayaran.";
            if ($discountAmount > 0) {
                $notificationMessage .= " Anda hemat Rp " . number_format($discountAmount, 0, ',', '.');
            }

            UserNotification::query()->create([
                'user_id' => $userId,
                'type'    => 'order',
                'title'   => 'Pesanan berhasil dibuat',
                'message' => $notificationMessage,
                'is_read' => false,
            ]);

            CartItem::query()->where('user_id', $userId)->delete();

            // Send order confirmation email
            $order->load(['user', 'items.product', 'promotion']);
            Mail::to($order->user->email)->send(new OrderConfirmationMail($order));
        });

        return redirect()->route('user.orders.index')->with('success', 'Checkout berhasil, pesanan dibuat.');
    }

    private function resolveRajaOngkirCityId(string $provinceName, string $cityName): ?string
    {
        $normalize = fn (?string $v) => strtolower(trim((string) $v));
        $normalizeName = fn (?string $v) => preg_replace('/\s+/', ' ', preg_replace('/^(kota|kabupaten)\s+/i', '', $normalize($v ?? '')));

        $provinces = $this->raja->getProvinces();
        if (empty($provinces)) {
            return null;
        }
        $province = collect($provinces)->first(
            fn ($p) => $normalize($p['province'] ?? '') === $normalize($provinceName)
        );
        if (! $province) {
            return null;
        }

        $cities = $this->raja->getCities((string) ($province['province_id'] ?? ''));
        if (empty($cities)) {
            return null;
        }

        $targetName = $normalizeName($cityName);
        $city = collect($cities)->first(
            fn ($c) => $normalizeName($c['city_name'] ?? '') === $targetName
        );
        if ($city) {
            return (string) ($city['city_id'] ?? '');
        }

        $searchResults = $this->raja->searchDestinations($cityName, 20);
        if (empty($searchResults)) {
            return null;
        }
        $filtered = collect($searchResults)->filter(function ($row) use ($normalize, $normalizeName, $provinceName, $targetName) {
            $provinceMatch = $normalize($row['province_name'] ?? '') === $normalize($provinceName);
            $cityMatch = $normalizeName($row['city_name'] ?? '') === $targetName;
            return $provinceMatch && $cityMatch;
        });

        if ($filtered->isNotEmpty()) {
            return (string) ($filtered->first()['id'] ?? '');
        }

        return (string) (collect($searchResults)->first()['id'] ?? '');
    }
}

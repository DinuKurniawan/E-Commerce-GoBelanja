<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\RajaOngkirService;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\StoreSetting;
use App\Models\UserAddress;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserCheckoutController extends Controller
{
    public function __construct(private RajaOngkirService $raja) {}

    public function index(): Response
    {
        $cartItems = CartItem::query()
            ->where('user_id', auth()->id())
            ->with('product:id,name,slug,price,stock,weight,emoji')
            ->get();

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

        $subtotal    = (int) $cartItems->sum(fn ($item) => ($item->product?->price ?? 0) * $item->quantity);
        $totalWeight = (int) $cartItems->sum(fn ($item) => ($item->product?->weight ?? 500) * $item->quantity);

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

        return Inertia::render('User/Checkout', [
            'cartItems'      => $cartItems,
            'addresses'      => $addresses,
            'subtotal'       => $subtotal,
            'totalWeight'    => max($totalWeight, 1000),
            'originCityId'   => config('rajaongkir.origin_city_id'),
            'paymentMethods' => $paymentMethods,
            'bankAccounts'   => $bankAccounts,
        ]);
    }

    public function store(): RedirectResponse
    {
        $validated = request()->validate([
            'address_id'       => 'required|exists:user_addresses,id',
            'courier'          => 'required|in:jne,pos,tiki',
            'service'          => 'required|string|max:20',
            'service_label'    => 'required|string|max:200',
            'shipping_cost'    => 'required|integer|min:0',
            'payment_method'   => 'required|string|max:100',
            'notes'            => 'nullable|string|max:1000',
        ]);

        $userId  = auth()->id();
        $address = UserAddress::query()
            ->where('user_id', $userId)
            ->findOrFail($validated['address_id']);

        $cartItems = CartItem::query()
            ->where('user_id', $userId)
            ->with('product:id,name,price,stock')
            ->get();

        if ($cartItems->isEmpty()) {
            return back()->withErrors(['cart' => 'Keranjang kosong, tidak bisa checkout.']);
        }

        DB::transaction(function () use ($userId, $address, $validated, $cartItems) {
            $itemSubtotal = 0;

            foreach ($cartItems as $item) {
                $product = $item->product;
                if (! $product || $product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => 'Stok produk tidak mencukupi saat checkout.',
                    ]);
                }

                $itemSubtotal += $product->price * $item->quantity;
            }

            $courierLabel = strtoupper($validated['courier']) . ' ' . $validated['service'];
            $totalAmount  = $itemSubtotal + (int) $validated['shipping_cost'];
            $orderNumber  = 'INV-GB-' . now()->format('YmdHis') . '-' . $userId;

            $addressParts = array_filter([
                $address->full_address,
                $address->village_name,
                $address->district_name,
                $address->city_name,
                $address->province_name,
                $address->postal_code,
            ]);

            $order = Order::query()->create([
                'user_id'          => $userId,
                'order_number'     => $orderNumber,
                'total_amount'     => $totalAmount,
                'status'           => 'pending',
                'shipping_courier' => $courierLabel . ' — ' . $validated['service_label'],
                'tracking_number'  => null,
                'shipping_address' => "{$address->label} — {$address->recipient_name} ({$address->phone}) | " . implode(', ', $addressParts),
                'payment_status'   => 'pending',
                'notes'            => $validated['notes'] ?? null,
            ]);

            foreach ($cartItems as $item) {
                $product  = $item->product;
                $subtotal = $product->price * $item->quantity;

                OrderItem::query()->create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item->quantity,
                    'unit_price' => $product->price,
                    'subtotal'   => $subtotal,
                ]);

                $product->decrement('stock', $item->quantity);
            }

            Payment::query()->create([
                'order_id'    => $order->id,
                'method'      => $validated['payment_method'],
                'status'      => 'pending',
                'proof_image' => null,
                'amount'      => $totalAmount,
                'paid_at'     => null,
            ]);

            UserNotification::query()->create([
                'user_id' => $userId,
                'type'    => 'order',
                'title'   => 'Pesanan berhasil dibuat',
                'message' => "Pesanan {$order->order_number} berhasil dibuat dan menunggu pembayaran.",
                'is_read' => false,
            ]);

            CartItem::query()->where('user_id', $userId)->delete();
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

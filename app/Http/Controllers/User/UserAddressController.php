<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\RajaOngkirService;
use App\Models\UserAddress;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserAddressController extends Controller
{
    public function __construct(private RajaOngkirService $raja) {}

    public function index(): Response
    {
        $addresses = UserAddress::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('User/Addresses', [
            'addresses' => $addresses,
        ]);
    }

    public function store(): RedirectResponse
    {
        $validated = request()->validate([
            'label'              => 'required|string|max:100',
            'recipient_name'     => 'required|string|max:255',
            'phone'              => 'required|string|max:30',
            'province_id'        => 'nullable|string|max:10',
            'province_name'      => 'nullable|string|max:100',
            'city_id'            => 'nullable|string|max:10',
            'city_name'          => 'nullable|string|max:100',
            'district_id'        => 'nullable|string|max:20',
            'district_name'      => 'nullable|string|max:150',
            'village_name'       => 'nullable|string|max:150',
            'postal_code'        => 'nullable|string|max:10',
            'rajaongkir_city_id' => 'nullable|string|max:10',
            'full_address'       => 'required|string|max:1000',
            'is_default'         => 'boolean',
        ]);

        $validated['rajaongkir_city_id'] = $this->resolveRajaOngkirCityId(
            $validated['province_name'] ?? null,
            $validated['city_name'] ?? null,
            $validated['rajaongkir_city_id'] ?? null,
        );

        $this->resetDefaultIfNeeded((bool) ($validated['is_default'] ?? false));

        UserAddress::query()->create([
            ...$validated,
            'user_id'    => auth()->id(),
            'is_default' => (bool) ($validated['is_default'] ?? false),
        ]);

        return back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function update(UserAddress $address): RedirectResponse
    {
        abort_unless($address->user_id === auth()->id(), 403);

        $validated = request()->validate([
            'label'              => 'required|string|max:100',
            'recipient_name'     => 'required|string|max:255',
            'phone'              => 'required|string|max:30',
            'province_id'        => 'nullable|string|max:10',
            'province_name'      => 'nullable|string|max:100',
            'city_id'            => 'nullable|string|max:10',
            'city_name'          => 'nullable|string|max:100',
            'district_id'        => 'nullable|string|max:20',
            'district_name'      => 'nullable|string|max:150',
            'village_name'       => 'nullable|string|max:150',
            'postal_code'        => 'nullable|string|max:10',
            'rajaongkir_city_id' => 'nullable|string|max:10',
            'full_address'       => 'required|string|max:1000',
            'is_default'         => 'boolean',
        ]);

        $validated['rajaongkir_city_id'] = $this->resolveRajaOngkirCityId(
            $validated['province_name'] ?? null,
            $validated['city_name'] ?? null,
            $validated['rajaongkir_city_id'] ?? null,
        );

        $this->resetDefaultIfNeeded((bool) ($validated['is_default'] ?? false), $address->id);

        $address->update([
            ...$validated,
            'is_default' => (bool) ($validated['is_default'] ?? false),
        ]);

        return back()->with('success', 'Alamat berhasil diperbarui.');
    }

    public function destroy(UserAddress $address): RedirectResponse
    {
        abort_unless($address->user_id === auth()->id(), 403);

        $address->delete();

        return back()->with('success', 'Alamat berhasil dihapus.');
    }

    public function setDefault(UserAddress $address): RedirectResponse
    {
        abort_unless($address->user_id === auth()->id(), 403);

        UserAddress::query()
            ->where('user_id', auth()->id())
            ->update(['is_default' => false]);

        $address->update(['is_default' => true]);

        return back()->with('success', 'Alamat default berhasil diperbarui.');
    }

    private function resetDefaultIfNeeded(bool $isDefault, ?int $exceptId = null): void
    {
        if (! $isDefault) {
            return;
        }

        $query = UserAddress::query()
            ->where('user_id', auth()->id());

        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }

        $query->update(['is_default' => false]);
    }

    private function resolveRajaOngkirCityId(?string $provinceName, ?string $cityName, ?string $existingId): ?string
    {
        if (! empty($existingId)) {
            return $existingId;
        }
        if (! $provinceName || ! $cityName) {
            return null;
        }

        $provinces = $this->raja->getProvinces();
        if (empty($provinces)) {
            return null;
        }

        $normalize = fn (?string $v) => strtolower(trim((string) $v));
        $normalizeName = fn (?string $v) => preg_replace('/\s+/', ' ', preg_replace('/^(kota|kabupaten)\s+/i', '', $normalize($v ?? '')));
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

        $target = $normalize($cityName);
        $targetName = $normalizeName($cityName);
        $exact = collect($cities)->first(
            fn ($c) => $normalize(($c['type'] ?? '') . ' ' . ($c['city_name'] ?? '')) === $target
        );
        if ($exact) {
            return (string) ($exact['city_id'] ?? '');
        }

        $exactName = collect($cities)->first(
            fn ($c) => $normalizeName($c['city_name'] ?? '') === $targetName
        );
        if ($exactName) {
            return (string) ($exactName['city_id'] ?? '');
        }

        $partial = collect($cities)->first(
            fn ($c) => str_contains($target, $normalize($c['city_name'] ?? ''))
        );

        if ($partial) {
            return (string) ($partial['city_id'] ?? '');
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

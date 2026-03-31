<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RajaOngkirService
{
    private string $apiKey;
    private string $baseUrl;
    private string $komerceBaseUrl;
    private string $komerceOriginId;
    public string $originCityId;
    private ?string $lastError = null;

    public function __construct()
    {
        $this->apiKey       = config('rajaongkir.api_key');
        $this->baseUrl      = rtrim(config('rajaongkir.base_url'), '/');
        $this->originCityId = config('rajaongkir.origin_city_id');
        $this->komerceBaseUrl = rtrim((string) config('rajaongkir.komerce_base_url'), '/');
        $this->komerceOriginId = (string) config('rajaongkir.komerce_origin_id');
    }

    public function getProvinces(): array
    {
        $this->lastError = null;
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->withoutVerifying()
            ->get("{$this->baseUrl}/province");

        if ($response->status() === 410) {
            return $this->getProvincesFromKomerce();
        }

        if ($response->failed()) {
            $this->lastError = $this->extractErrorMessage($response);
            return [];
        }

        return $response->json('rajaongkir.results', []);
    }

    public function getCities(?string $provinceId = null): array
    {
        $this->lastError = null;
        $params = [];
        if ($provinceId) {
            $params['province'] = $provinceId;
        }

        $response = Http::withHeaders(['key' => $this->apiKey])
            ->withoutVerifying()
            ->get("{$this->baseUrl}/city", $params);

        if ($response->status() === 410) {
            return $this->getCitiesFromKomerce($provinceId);
        }

        if ($response->failed()) {
            $this->lastError = $this->extractErrorMessage($response);
            return [];
        }

        return $response->json('rajaongkir.results', []);
    }

    /**
     * Calculate shipping cost.
     *
     * @param  string  $destination  Destination city_id
     * @param  int     $weightGrams  Total weight in grams (minimum 1000)
     * @param  string  $courier      jne|pos|tiki
     * @return array   Flat list of service options with cost + etd
     */
    public function getCost(string $destination, int $weightGrams, string $courier): array
    {
        $this->lastError = null;
        $weight = max($weightGrams, 1000); // Raja Ongkir minimum 1 kg

        $response = Http::withHeaders(['key' => $this->apiKey])
            ->withoutVerifying()
            ->asForm()
            ->post("{$this->baseUrl}/cost", [
                'origin'      => $this->originCityId,
                'destination' => $destination,
                'weight'      => $weight,
                'courier'     => strtolower($courier),
            ]);

        if ($response->status() === 410) {
            return $this->getCostFromKomerce($destination, $weight, $courier);
        }

        if ($response->failed()) {
            $this->lastError = $this->extractErrorMessage($response);
            return [];
        }

        $results = $response->json('rajaongkir.results', []);
        if (empty($results)) {
            return [];
        }

        $services = [];
        foreach ($results as $courierResult) {
            foreach ($courierResult['costs'] ?? [] as $cost) {
                $services[] = [
                    'courier'      => $courierResult['code'],
                    'courier_name' => $courierResult['name'],
                    'service'      => $cost['service'],
                    'description'  => $cost['description'],
                    'cost'         => $cost['cost'][0]['value'] ?? 0,
                    'etd'          => $cost['cost'][0]['etd'] ?? '-',
                ];
            }
        }

        return $services;
    }

    /**
     * Compare shipping costs across multiple couriers.
     *
     * @param  string  $destination  Destination city_id
     * @param  int     $weightGrams  Total weight in grams
     * @param  array   $couriers     Array of courier codes (default: all major couriers)
     * @return array   Combined list of all courier services with costs
     */
    public function compareAllCouriers(string $destination, int $weightGrams, array $couriers = []): array
    {
        if (empty($couriers)) {
            $couriers = ['jne', 'tiki', 'pos', 'sicepat', 'jnt'];
        }

        $allServices = [];
        foreach ($couriers as $courier) {
            $services = $this->getCost($destination, $weightGrams, $courier);
            $allServices = array_merge($allServices, $services);
        }

        return $allServices;
    }

    /**
     * Track shipment (mock data since RajaOngkir doesn't have tracking API).
     *
     * @param  string  $courier         Courier code (jne, tiki, etc.)
     * @param  string  $trackingNumber  Tracking/AWB number
     * @return array   Mock tracking data
     */
    public function trackShipment(string $courier, string $trackingNumber): array
    {
        // Since RajaOngkir doesn't provide tracking API, return mock data
        // In production, you could integrate with courier-specific APIs
        
        $courierNames = [
            'jne' => 'JNE',
            'tiki' => 'TIKI',
            'pos' => 'POS Indonesia',
            'sicepat' => 'SiCepat',
            'jnt' => 'J&T Express',
        ];

        $courierName = $courierNames[strtolower($courier)] ?? strtoupper($courier);

        return [
            'courier' => $courierName,
            'tracking_number' => $trackingNumber,
            'status' => 'in_transit',
            'status_label' => 'Dalam Perjalanan',
            'estimated_delivery' => now()->addDays(2)->format('Y-m-d'),
            'tracking_url' => $this->getTrackingUrl($courier, $trackingNumber),
            'history' => $this->getMockTrackingHistory(),
        ];
    }

    /**
     * Get tracking URL for a courier.
     */
    private function getTrackingUrl(string $courier, string $trackingNumber): ?string
    {
        $urls = [
            'jne' => "https://www.jne.co.id/id/tracking/trace/{$trackingNumber}",
            'tiki' => "https://www.tiki.id/id/tracking?kode={$trackingNumber}",
            'pos' => "https://www.posindonesia.co.id/id/tracking?barcode={$trackingNumber}",
            'sicepat' => "https://www.sicepat.com/checkAwb/{$trackingNumber}",
            'jnt' => "https://www.jet.co.id/track?awb={$trackingNumber}",
        ];

        return $urls[strtolower($courier)] ?? null;
    }

    /**
     * Generate mock tracking history.
     */
    private function getMockTrackingHistory(): array
    {
        return [
            [
                'status' => 'delivered',
                'status_label' => 'Telah Diterima',
                'description' => 'Paket telah diterima oleh penerima',
                'location' => 'Jakarta Selatan',
                'timestamp' => now()->subDays(0)->format('Y-m-d H:i:s'),
            ],
            [
                'status' => 'out_for_delivery',
                'status_label' => 'Dalam Pengiriman',
                'description' => 'Paket sedang dalam proses pengiriman ke alamat tujuan',
                'location' => 'Jakarta Selatan Hub',
                'timestamp' => now()->subDays(0)->subHours(3)->format('Y-m-d H:i:s'),
            ],
            [
                'status' => 'in_transit',
                'status_label' => 'Dalam Perjalanan',
                'description' => 'Paket dalam perjalanan menuju kota tujuan',
                'location' => 'Sorting Center Jakarta',
                'timestamp' => now()->subDays(1)->format('Y-m-d H:i:s'),
            ],
            [
                'status' => 'picked_up',
                'status_label' => 'Paket Diambil',
                'description' => 'Paket telah diambil oleh kurir',
                'location' => 'Bandung',
                'timestamp' => now()->subDays(2)->format('Y-m-d H:i:s'),
            ],
            [
                'status' => 'processing',
                'status_label' => 'Diproses',
                'description' => 'Paket sedang diproses di warehouse',
                'location' => 'Bandung Hub',
                'timestamp' => now()->subDays(3)->format('Y-m-d H:i:s'),
            ],
        ];
    }

    public function searchDestinations(string $search, int $limit = 20): array
    {
        $this->lastError = null;

        $response = Http::withHeaders(['key' => $this->apiKey])
            ->withoutVerifying()
            ->get("{$this->komerceBaseUrl}/destination/domestic-destination", [
                'search' => $search,
                'limit' => $limit,
                'offset' => 0,
            ]);

        if ($response->failed()) {
            $this->lastError = $this->extractErrorMessage($response);
            return [];
        }

        $items = $response->json('data', []);
        return is_array($items) ? $items : [];
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    private function extractErrorMessage($response): string
    {
        $status = $response->status();
        $bodyMessage = $response->json('message')
            ?? $response->json('meta.message')
            ?? $response->json('rajaongkir.status.description')
            ?? 'Raja Ongkir API error';

        if ($status === 410) {
            return 'Endpoint Raja Ongkir lama sudah nonaktif. Harap migrasi API key ke Komerce RajaOngkir.';
        }

        if (str_contains(strtolower((string) $bodyMessage), 'invalid api key')) {
            return 'API key RajaOngkir tidak valid. Periksa API key terbaru dari Komerce.';
        }

        return "{$bodyMessage} (HTTP {$status})";
    }

    private function getProvincesFromKomerce(): array
    {
        $response = Http::withHeaders(['key' => $this->apiKey])
            ->withoutVerifying()
            ->get("{$this->komerceBaseUrl}/destination/province");

        if ($response->failed()) {
            $this->lastError = $this->extractErrorMessage($response);
            return [];
        }

        $items = collect($response->json('data', []))
            ->filter(fn ($d) => !empty($d['id']) && !empty($d['name']))
            ->map(fn ($d) => [
                'province_id' => (string) ($d['id'] ?? ''),
                'province' => (string) ($d['name'] ?? ''),
            ])
            ->unique('province_id')
            ->values()
            ->all();

        return $items;
    }

    private function getCitiesFromKomerce(?string $provinceId = null): array
    {
        if (! $provinceId) {
            $this->lastError = 'province_id diperlukan untuk memuat kota.';
            return [];
        }

        $response = Http::withHeaders(['key' => $this->apiKey])
            ->withoutVerifying()
            ->get("{$this->komerceBaseUrl}/destination/city/{$provinceId}");

        if ($response->failed()) {
            $this->lastError = $this->extractErrorMessage($response);
            return [];
        }

        return collect($response->json('data', []))
            ->map(function ($d) use ($provinceId) {
                $name = (string) ($d['name'] ?? '');
                $upper = strtoupper($name);
                $type = str_contains($upper, 'KABUPATEN') ? 'Kabupaten' : 'Kota';
                $cityName = preg_replace('/^(KABUPATEN|KOTA)\s+/i', '', $name) ?: $name;
                return [
                    'city_id' => (string) ($d['id'] ?? ''),
                    'province_id' => (string) $provinceId,
                    'type' => $type,
                    'city_name' => trim($cityName),
                    'postal_code' => (string) ($d['zip_code'] ?? ''),
                ];
            })
            ->filter(fn ($c) => !empty($c['city_id']) && !empty($c['city_name']))
            ->unique('city_id')
            ->values()
            ->all();
    }

    private function getCostFromKomerce(string $destination, int $weight, string $courier): array
    {
        if (! $this->komerceOriginId) {
            $this->lastError = 'RAJAONGKIR_KOMERCE_ORIGIN_ID belum diisi.';
            return [];
        }

        $response = Http::withHeaders(['key' => $this->apiKey])
            ->withoutVerifying()
            ->asForm()
            ->post("{$this->komerceBaseUrl}/calculate/domestic-cost", [
                'origin' => $this->komerceOriginId,
                'destination' => $destination,
                'weight' => $weight,
                'courier' => strtolower($courier),
                'price' => 'lowest',
            ]);

        if ($response->failed()) {
            $this->lastError = $this->extractErrorMessage($response);
            return [];
        }

        $results = $response->json('data', []);
        if (!is_array($results)) {
            return [];
        }

        $services = [];
        foreach ($results as $row) {
            $services[] = [
                'courier' => strtolower((string) ($row['code'] ?? $courier)),
                'courier_name' => (string) ($row['name'] ?? strtoupper($courier)),
                'service' => (string) ($row['service'] ?? 'REG'),
                'description' => (string) ($row['service'] ?? 'Layanan'),
                'cost' => (int) ($row['cost'] ?? 0),
                'etd' => (string) ($row['etd'] ?? '-'),
            ];
        }

        return $services;
    }
}

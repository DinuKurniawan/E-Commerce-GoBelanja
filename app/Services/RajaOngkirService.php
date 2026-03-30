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

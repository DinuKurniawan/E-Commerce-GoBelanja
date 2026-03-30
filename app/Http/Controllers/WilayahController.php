<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class WilayahController extends Controller
{
    private const BASE = 'https://alamat.thecloudalert.com/api';
    private const TTL  = 60 * 60 * 24 * 7; // 1 week – data is relatively static

    /** GET /wilayah/provinces */
    public function provinces(): JsonResponse
    {
        $data = $this->fetchCached('cloudalert_provinces', self::BASE . '/provinsi/get/');
        return response()->json($data);
    }

    /** GET /wilayah/kabkota?provinsi_id= */
    public function kabkota(): JsonResponse
    {
        $provinsiId = trim(request('provinsi_id', ''));
        if (! $provinsiId) {
            return response()->json([]);
        }
        $data = $this->fetchCached(
            "cloudalert_kabkota_{$provinsiId}",
            self::BASE . "/kabkota/get/?d_provinsi_id={$provinsiId}"
        );
        return response()->json($data);
    }

    /** GET /wilayah/kecamatan?kabkota_id= */
    public function kecamatan(): JsonResponse
    {
        $kabkotaId = trim(request('kabkota_id', ''));
        if (! $kabkotaId) {
            return response()->json([]);
        }
        $data = $this->fetchCached(
            "cloudalert_kecamatan_{$kabkotaId}",
            self::BASE . "/kecamatan/get/?d_kabkota_id={$kabkotaId}"
        );
        return response()->json($data);
    }

    /** GET /wilayah/kelurahan?kecamatan_id= */
    public function kelurahan(): JsonResponse
    {
        $kecamatanId = trim(request('kecamatan_id', ''));
        if (! $kecamatanId) {
            return response()->json([]);
        }
        $data = $this->fetchCached(
            "cloudalert_kelurahan_{$kecamatanId}",
            self::BASE . "/kelurahan/get/?d_kecamatan_id={$kecamatanId}"
        );
        return response()->json($data);
    }

    private function fetchCached(string $key, string $url): array
    {
        return Cache::remember($key, self::TTL, function () use ($url) {
            $response = Http::timeout(15)->withoutVerifying()->get($url);
            if (! $response->successful()) {
                return [];
            }
            return $response->json('result') ?? [];
        });
    }
}

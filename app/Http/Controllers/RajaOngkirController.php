<?php

namespace App\Http\Controllers;

use App\Services\RajaOngkirService;
use Illuminate\Http\JsonResponse;

class RajaOngkirController extends Controller
{
    public function __construct(private RajaOngkirService $raja) {}

    public function provinces(): JsonResponse
    {
        $data = $this->raja->getProvinces();
        if (empty($data) && $this->raja->getLastError()) {
            return response()->json([
                'message' => $this->raja->getLastError(),
            ], 422);
        }
        return response()->json($data);
    }

    public function cities(): JsonResponse
    {
        $provinceId = request('province_id');
        $data = $this->raja->getCities($provinceId);
        if (empty($data) && $this->raja->getLastError()) {
            return response()->json([
                'message' => $this->raja->getLastError(),
            ], 422);
        }
        return response()->json($data);
    }

    public function destinations(): JsonResponse
    {
        $search = trim((string) request('search', ''));
        if ($search === '') {
            return response()->json([]);
        }

        $data = $this->raja->searchDestinations($search);
        if (empty($data) && $this->raja->getLastError()) {
            return response()->json([
                'message' => $this->raja->getLastError(),
            ], 422);
        }

        return response()->json($data);
    }

    public function cost(): JsonResponse
    {
        $validated = request()->validate([
            'destination' => 'required|string',
            'weight'      => 'required|integer|min:1',
            'courier'     => 'required|in:jne,pos,tiki',
        ]);

        $services = $this->raja->getCost(
            $validated['destination'],
            (int) $validated['weight'],
            $validated['courier'],
        );

        if (empty($services) && $this->raja->getLastError()) {
            return response()->json([
                'message' => $this->raja->getLastError(),
            ], 422);
        }

        return response()->json($services);
    }
}

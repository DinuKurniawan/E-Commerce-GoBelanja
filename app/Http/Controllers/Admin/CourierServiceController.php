<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourierService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourierServiceController extends Controller
{
    /**
     * Display a listing of courier services.
     */
    public function index()
    {
        $couriers = CourierService::orderBy('sort_order')
            ->orderBy('code')
            ->orderBy('service_type')
            ->get();

        return Inertia::render('Admin/CourierServices', [
            'couriers' => $couriers,
        ]);
    }

    /**
     * Store a newly created courier service.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:100',
            'service_type' => 'required|string|max:50',
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'etd' => 'nullable|string|max:50',
            'supports_tracking' => 'boolean',
            'tracking_url_template' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        try {
            CourierService::create($validated);

            return redirect()->back()->with('success', 'Layanan kurir berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menambahkan layanan kurir: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified courier service.
     */
    public function update(Request $request, CourierService $courierService)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:100',
            'service_type' => 'required|string|max:50',
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'etd' => 'nullable|string|max:50',
            'supports_tracking' => 'boolean',
            'tracking_url_template' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        try {
            $courierService->update($validated);

            return redirect()->back()->with('success', 'Layanan kurir berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui layanan kurir: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified courier service.
     */
    public function destroy(CourierService $courierService)
    {
        try {
            $courierService->delete();

            return redirect()->back()->with('success', 'Layanan kurir berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus layanan kurir: ' . $e->getMessage());
        }
    }

    /**
     * Toggle courier service active status.
     */
    public function toggle(CourierService $courierService)
    {
        try {
            $courierService->update([
                'is_active' => !$courierService->is_active,
            ]);

            $status = $courierService->is_active ? 'diaktifkan' : 'dinonaktifkan';

            return redirect()->back()->with('success', "Layanan kurir berhasil {$status}");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengubah status layanan kurir: ' . $e->getMessage());
        }
    }
}

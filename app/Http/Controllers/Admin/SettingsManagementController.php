<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsManagementController extends Controller
{
    public function index(): Response
    {
        $setting = StoreSetting::query()->first();

        return Inertia::render('Admin/Settings', [
            'setting' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name'     => 'required|string|max:255',
            'store_logo'     => 'nullable|string|max:255',
            'payment_method' => 'required|string|max:255',
            'bank_accounts'  => 'nullable|array',
            'bank_accounts.*.bank'   => 'required|string|max:100',
            'bank_accounts.*.number' => 'required|string|max:50',
            'bank_accounts.*.holder' => 'required|string|max:100',
            'api_key'        => 'nullable|string|max:255',
        ]);

        StoreSetting::query()->updateOrCreate(
            ['id' => 1],
            $validated,
        );

        return back()->with('success', 'Pengaturan toko berhasil diperbarui.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BannerManagementController extends Controller
{
    public function index()
    {
        $banners = Banner::ordered()->get();

        return Inertia::render('Admin/Banners', [
            'banners' => $banners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
            'link' => 'nullable|string|max:255',
            'target_blank' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $path = $request->file('image')->store('banners', 'public');

        $maxOrder = Banner::max('sort_order') ?? 0;

        Banner::create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'image' => $path,
            'link' => $validated['link'] ?? null,
            'target_blank' => $validated['target_blank'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Banner berhasil ditambahkan.');
    }

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
            'link' => 'nullable|string|max:255',
            'target_blank' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($request->hasFile('image')) {
            if ($banner->image && Storage::disk('public')->exists($banner->image)) {
                Storage::disk('public')->delete($banner->image);
            }
            $validated['image'] = $request->file('image')->store('banners', 'public');
        } else {
            unset($validated['image']);
        }

        $validated['target_blank'] = $validated['target_blank'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $banner->update($validated);

        return back()->with('success', 'Banner berhasil diperbarui.');
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image && Storage::disk('public')->exists($banner->image)) {
            Storage::disk('public')->delete($banner->image);
        }

        $banner->delete();

        return back()->with('success', 'Banner berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:banners,id',
        ]);

        foreach ($request->ids as $index => $id) {
            Banner::where('id', $id)->update(['sort_order' => $index]);
        }

        return back()->with('success', 'Urutan banner berhasil diperbarui.');
    }

    public function toggle(Banner $banner)
    {
        $banner->update(['is_active' => !$banner->is_active]);

        return back()->with('success', $banner->is_active ? 'Banner diaktifkan.' : 'Banner dinonaktifkan.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\ImageKitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminBannerController extends Controller
{
    public function index(): Response
    {
        $banners = Banner::orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Banners/Form', [
            'banner' => null,
        ]);
    }

    public function store(Request $request, ImageKitService $imageKitService): RedirectResponse
    {
        $data = $this->validatedBannerData($request);
        $banner = Banner::create($data);

        if ($request->hasFile('image_file')) {
            $imageKitService->queueUpload($request->file('image_file'), Banner::class, $banner->id, 'banner_image', '/banners');
        }

        return redirect()->route('admin.banners.index')->with('success', 'Banner created successfully.');
    }

    public function edit(Banner $banner): Response
    {
        return Inertia::render('Admin/Banners/Form', [
            'banner' => $banner,
        ]);
    }

    public function update(Request $request, Banner $banner, ImageKitService $imageKitService): RedirectResponse
    {
        $data = $this->validatedBannerData($request, $banner);
        $banner->update($data);

        if ($request->hasFile('image_file')) {
            $imageKitService->queueUpload($request->file('image_file'), Banner::class, $banner->id, 'banner_image', '/banners');
        }

        return redirect()->route('admin.banners.index')->with('success', 'Banner updated successfully.');
    }

    public function toggleActive(Banner $banner): RedirectResponse
    {
        $banner->update(['is_active' => !$banner->is_active]);

        return back()->with('success', 'Banner status updated.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner deleted.');
    }

    private function validatedBannerData(Request $request, ?Banner $banner = null): array
    {
        $validated = $request->validate([
            'image_file' => ($banner ? 'nullable' : 'required') . '|image|max:5120',
            'cta_link' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0|max:9999',
            'is_active' => 'nullable|boolean',
        ]);

        return [
            'banner_image' => $banner?->banner_image,
            'cta_link' => !empty($validated['cta_link']) ? trim($validated['cta_link']) : '/catalog',
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
            'is_active' => $request->boolean('is_active', true),
        ];
    }
}


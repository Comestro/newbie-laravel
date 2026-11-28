<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\ImageKitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $categories = Category::flatTree(onlyActive: false, withCounts: true);

        if ($search) {
            $needle = mb_strtolower($search);
            $categories = $categories->filter(
                fn ($cat) => str_contains(mb_strtolower($cat->name), $needle)
                    || str_contains(mb_strtolower($cat->slug), $needle)
                    || str_contains(mb_strtolower((string) $cat->path), $needle)
            )->values();
        }

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories->values(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Form', [
            'category' => null,
            'parentCategories' => Category::flatTree(onlyActive: false),
        ]);
    }

    public function store(Request $request, ImageKitService $imageKitService): RedirectResponse
    {
        $data = $this->validatedCategoryData($request);
        $category = Category::create($data);

        if ($request->hasFile('image_file')) {
            $imageKitService->queueUpload($request->file('image_file'), Category::class, $category->id, 'icon', '/categories');
        }

        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(Category $category): Response
    {
        $excludeIds = [$category->id, ...$category->descendantIds()];

        return Inertia::render('Admin/Categories/Form', [
            'category' => $category,
            'parentCategories' => Category::flatTree(onlyActive: false, excludeIds: $excludeIds),
        ]);
    }

    public function update(Request $request, Category $category, ImageKitService $imageKitService): RedirectResponse
    {
        $data = $this->validatedCategoryData($request, $category);
        $category->update($data);

        if ($request->hasFile('image_file')) {
            $imageKitService->queueUpload($request->file('image_file'), Category::class, $category->id, 'icon', '/categories');
        }

        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully.');
    }

    private function validatedCategoryData(Request $request, ?Category $category = null): array
    {
        $idRule = $category ? ',' . $category->id : '';

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name' . $idRule,
            'slug' => 'nullable|string|max:100|unique:categories,slug' . $idRule,
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'icon' => 'nullable|string|max:500',
            'image_file' => 'nullable|image|max:5120',
            'remove_icon' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $parentId = $validated['parent_id'] ?? null;
        if ($parentId && $category) {
            $forbiddenIds = [$category->id, ...$category->descendantIds()];
            if (in_array((int) $parentId, $forbiddenIds, true)) {
                $parentId = null;
            }
        }

        $slug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $icon = $category?->icon;
        if ($request->boolean('remove_icon') && !$request->hasFile('image_file')) {
            $icon = null;
        } elseif (!$request->hasFile('image_file') && array_key_exists('icon', $validated)) {
            $icon = !empty($validated['icon']) ? trim($validated['icon']) : null;
        }

        return [
            'parent_id' => $parentId,
            'name' => $validated['name'],
            'slug' => $slug,
            'icon' => $icon,
            'is_active' => $request->boolean('is_active', true),
        ];
    }

    public function toggleActive(Category $category): RedirectResponse
    {
        $category->update(['is_active' => !$category->is_active]);

        return back()->with('success', "Category status changed to " . ($category->is_active ? 'active' : 'inactive') . ".");
    }

    public function destroy(Category $category): RedirectResponse
    {
        foreach (array_reverse($category->descendantIds()) as $descendantId) {
            Category::where('id', $descendantId)->delete();
        }
        $category->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Category deleted successfully.');
    }
}

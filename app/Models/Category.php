<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function getRouteKeyName()
    {
        return 'id';
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('name');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Collect all descendant category IDs recursively.
     */
    public function descendantIds(): array
    {
        $all = static::all(['id', 'parent_id'])->groupBy('parent_id');
        $ids = [];
        $queue = [$this->id];

        while (!empty($queue)) {
            $currentId = array_shift($queue);
            foreach ($all->get($currentId, collect()) as $child) {
                if (!in_array($child->id, $ids, true)) {
                    $ids[] = $child->id;
                    $queue[] = $child->id;
                }
            }
        }

        return $ids;
    }

    /**
     * Resolve category ID + all nested descendant IDs matching a slug, name, or id filter.
     */
    public static function matchingIdsForFilter(string $filter): array
    {
        $matches = static::where('slug', $filter)
            ->orWhere('name', $filter)
            ->orWhere('id', $filter)
            ->get(['id']);

        $ids = [];
        foreach ($matches as $category) {
            $ids[] = $category->id;
            array_push($ids, ...$category->descendantIds());
        }

        return array_values(array_unique($ids));
    }

    /**
     * Build a depth-first flattened tree with `depth` and `path` attributes.
     */
    public static function flatTree(bool $onlyActive = true, array $excludeIds = [], bool $withCounts = false): Collection
    {
        $query = static::query()
            ->with('parent:id,name')
            ->when($onlyActive, fn ($q) => $q->where('is_active', true))
            ->when($withCounts, fn ($q) => $q->withCount(['products', 'children']))
            ->orderBy('name');

        $all = $query->get()->reject(fn ($cat) => in_array($cat->id, $excludeIds, true));
        $byId = $all->keyBy('id');
        $grouped = $all->groupBy(fn ($cat) => $cat->parent_id && $byId->has($cat->parent_id) ? $cat->parent_id : 0);

        $result = collect();
        $walk = function (int $parentId, int $depth, string $prefix) use (&$walk, $grouped, &$result) {
            foreach ($grouped->get($parentId, collect()) as $cat) {
                $path = $prefix ? "{$prefix} → {$cat->name}" : $cat->name;
                $cat->setAttribute('depth', $depth);
                $cat->setAttribute('path', $path);
                $result->push($cat);
                $walk($cat->id, $depth + 1, $path);
            }
        };

        $walk(0, 0, '');

        return $result;
    }

    public static function activeOrdered(): Collection
    {
        return static::flatTree(onlyActive: true);
    }
}

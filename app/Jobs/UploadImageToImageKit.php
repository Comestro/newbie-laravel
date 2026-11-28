<?php

namespace App\Jobs;

use App\Models\ProductImage;
use App\Services\ImageKitService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class UploadImageToImageKit implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        public string $tempPath,
        public string $originalName,
        public string $modelClass,
        public int $modelId,
        public string $column,
        public string $folder = '/products',
        public ?string $oldFileId = null,
        public ?string $oldFilePath = null
    ) {}

    public function handle(ImageKitService $imageKitService): void
    {
        if (!Storage::disk('local')->exists($this->tempPath)) {
            return;
        }

        try {
            $model = ($this->modelClass)::find($this->modelId);
            if (!$model) {
                return;
            }

            $fullPath = Storage::disk('local')->path($this->tempPath);
            $uploadRes = $imageKitService->upload($fullPath, $this->originalName, $this->folder);

            if (empty($uploadRes['url'])) {
                return;
            }

            if ($model instanceof ProductImage) {
                $model->update([
                    'url' => $uploadRes['url'],
                    'file_id' => $uploadRes['file_id'] ?? null,
                    'file_path' => $uploadRes['file_path'] ?? null,
                    'thumbnail_url' => $uploadRes['thumbnail_url'] ?? null,
                ]);

                if ($model->is_primary && $model->variant) {
                    $model->variant->update(['image_url' => $uploadRes['url']]);
                }
            } else {
                $model->update([
                    $this->column => $uploadRes['url'],
                ]);
            }

            if ($this->oldFileId || $this->oldFilePath) {
                $imageKitService->delete($this->oldFileId, $this->oldFilePath);
            }
        } finally {
            Storage::disk('local')->delete($this->tempPath);
        }
    }
}


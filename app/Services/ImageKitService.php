<?php

namespace App\Services;

use App\Jobs\UploadImageToImageKit;
use Illuminate\Http\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageKitService
{
    protected ?string $publicKey;
    protected ?string $privateKey;
    protected ?string $urlEndpoint;

    public function __construct()
    {
        $this->publicKey = config('services.imagekit.public_key');
        $this->privateKey = config('services.imagekit.private_key');
        $this->urlEndpoint = config('services.imagekit.url_endpoint');
    }

    public function isConfigured(): bool
    {
        return !empty($this->privateKey);
    }

    /**
     * Upload an image to ImageKit (or fallback to local public disk storage if not configured).
     *
     * @param  UploadedFile|string  $file
     * @param  string|null  $fileName
     * @param  string  $folder
     * @return array{url: string, file_id: ?string, thumbnail_url: ?string, file_path: ?string}
     */
    public function upload($file, ?string $fileName = null, string $folder = '/products'): array
    {
        // 1. If it's already a URL string (e.g. direct ImageKit URL), return it directly
        if (is_string($file) && (Str::startsWith($file, ['http://', 'https://']) || Str::startsWith($file, '/storage/'))) {
            return [
                'url' => $file,
                'file_id' => null,
                'thumbnail_url' => $file,
                'file_path' => null,
            ];
        }

        // 2. If it's an UploadedFile or a local file path
        if ($file instanceof UploadedFile || (is_string($file) && is_file($file))) {
            $realPath = $file instanceof UploadedFile ? $file->getRealPath() : $file;
            $name = $fileName ?: ($file instanceof UploadedFile ? $file->getClientOriginalName() : basename($file));

            // If ImageKit credentials are configured, upload to ImageKit API
            if ($this->isConfigured()) {
                try {
                    $response = Http::withBasicAuth($this->privateKey, '')
                        ->attach('file', file_get_contents($realPath), $name)
                        ->post('https://upload.imagekit.io/api/v1/files/upload', [
                            'fileName' => $name,
                            'folder' => $folder,
                            'useUniqueFileName' => 'true',
                        ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        return [
                            'url' => $data['url'] ?? '',
                            'file_id' => $data['fileId'] ?? null,
                            'thumbnail_url' => $data['thumbnailUrl'] ?? ($data['url'] ?? ''),
                            'file_path' => $data['filePath'] ?? null,
                        ];
                    }

                    Log::error('ImageKit upload error: ' . $response->body());
                } catch (\Throwable $e) {
                    Log::error('ImageKit exception: ' . $e->getMessage());
                }
            }

            // Fallback to local storage (for local offline dev or when keys not yet provided)
            $storageFile = $file instanceof UploadedFile ? $file : new File($file);
            $path = Storage::disk('public')->putFile('products', $storageFile);
            $url = '/storage/' . $path;

            return [
                'url' => $url,
                'file_id' => null,
                'thumbnail_url' => $url,
                'file_path' => $path,
            ];
        }

        throw new \InvalidArgumentException('Invalid file provided for upload.');
    }

    /**
     * Store an uploaded file temporarily and dispatch a queued job to upload it to ImageKit.
     */
    public function queueUpload(
        UploadedFile $file,
        string $modelClass,
        int $modelId,
        string $column,
        string $folder = '/products',
        ?string $oldFileId = null,
        ?string $oldFilePath = null
    ): void {
        $tempPath = Storage::disk('local')->putFile('temp-uploads', $file);

        UploadImageToImageKit::dispatch(
            $tempPath,
            $file->getClientOriginalName(),
            $modelClass,
            $modelId,
            $column,
            $folder,
            $oldFileId,
            $oldFilePath
        )->afterCommit();
    }

    /**
     * Delete an image by ImageKit fileId or local file path.
     */
    public function delete(?string $fileId = null, ?string $filePath = null): bool
    {
        if ($fileId && $this->isConfigured()) {
            try {
                $response = Http::withBasicAuth($this->privateKey, '')
                    ->delete("https://api.imagekit.io/v1/files/{$fileId}");

                return $response->successful();
            } catch (\Throwable $e) {
                Log::error('ImageKit delete exception: ' . $e->getMessage());
            }
        }

        if ($filePath && Storage::disk('public')->exists($filePath)) {
            return Storage::disk('public')->delete($filePath);
        }

        return false;
    }
}


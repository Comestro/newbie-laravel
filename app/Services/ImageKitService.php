<?php

namespace App\Services;

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

        // 2. If it's an UploadedFile
        if ($file instanceof UploadedFile) {
            $name = $fileName ?: $file->getClientOriginalName();

            // If ImageKit credentials are configured, upload to ImageKit API
            if ($this->isConfigured()) {
                try {
                    $response = Http::withBasicAuth($this->privateKey, '')
                        ->attach('file', file_get_contents($file->getRealPath()), $name)
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
            $path = Storage::disk('public')->putFile('products', $file);
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


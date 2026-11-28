export function resolveImageUrl(path) {
    if (!path || typeof path !== 'string') return null;
    if (
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('/') ||
        path.startsWith('blob:') ||
        path.startsWith('data:')
    ) {
        return path;
    }
    return `/storage/${path}`;
}


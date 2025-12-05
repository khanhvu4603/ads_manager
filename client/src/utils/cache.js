export const CACHE_NAME = 'video-cache-v1';

export const cacheVideo = async (url) => {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    if (match) {
        return URL.createObjectURL(await match.blob());
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        await cache.put(url, new Response(blob));
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Failed to cache video:', error);
        return null;
    }
};

export const clearOldCache = async (currentUrls) => {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    for (const request of keys) {
        if (!currentUrls.includes(request.url)) {
            await cache.delete(request);
        }
    }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'api_cache_';
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes in milliseconds

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

class CacheService {
    private static instance: CacheService;

    private constructor() { }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    private getCacheKey(url: string): string {
        // Create a unique key for the URL
        return `${CACHE_PREFIX}${url}`;
    }

    public async get<T>(url: string): Promise<T | null> {
        try {
            const key = this.getCacheKey(url);
            const cached = await AsyncStorage.getItem(key);

            if (!cached) return null;

            const item: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();

            if (now - item.timestamp > CACHE_EXPIRATION) {
                console.log(`[CacheService] Expired: ${url}`);
                await AsyncStorage.removeItem(key);
                return null;
            }

            console.log(`[CacheService] Hit: ${url}`);
            return item.data;
        } catch (error) {
            console.error('[CacheService] Error getting cache:', error);
            return null;
        }
    }

    public async set<T>(url: string, data: T): Promise<void> {
        try {
            const key = this.getCacheKey(url);
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(key, JSON.stringify(item));
            console.log(`[CacheService] Set: ${url}`);
        } catch (error) {
            console.error('[CacheService] Error setting cache:', error);
        }
    }

    public async clearAll(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
            if (cacheKeys.length > 0) {
                await AsyncStorage.multiRemove(cacheKeys);
            }
            console.log('[CacheService] All cache cleared');
        } catch (error) {
            console.error('[CacheService] Error clearing cache:', error);
        }
    }
}

export const cacheService = CacheService.getInstance();

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    XtreamCredentials,
    XtreamLoginResponse,
    XtreamCategory,
    XtreamStream,
    XtreamVodInfo,
    XtreamSeries,
    XtreamSeriesInfo
} from '../types';
import { cacheService } from './cacheService';

class XtreamService {
    private static instance: XtreamService;
    private credentialsKey = 'xtream_credentials';

    private constructor() {
        axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    public static getInstance(): XtreamService {
        if (!XtreamService.instance) {
            XtreamService.instance = new XtreamService();
        }
        return XtreamService.instance;
    }

    private async fetchWithCache<T>(url: string): Promise<T> {
        const cachedData = await cacheService.get<T>(url);
        if (cachedData) {
            return cachedData;
        }

        const response = await axios.get(url, { timeout: 10000 });
        await cacheService.set(url, response.data);
        return response.data;
    }

    public async saveCredentials(creds: XtreamCredentials): Promise<void> {
        await AsyncStorage.setItem(this.credentialsKey, JSON.stringify(creds));
    }

    public async getCredentials(): Promise<XtreamCredentials | null> {
        const creds = await AsyncStorage.getItem(this.credentialsKey);
        return creds ? JSON.parse(creds) : null;
    }

    public async logout(): Promise<void> {
        await AsyncStorage.removeItem(this.credentialsKey);
    }

    public async isLoggedIn(): Promise<boolean> {
        const creds = await this.getCredentials();
        return !!creds;
    }

    private formatUrl(url: string): string {
        let formatted = url;
        if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
            formatted = 'http://' + formatted;
        }
        if (formatted.endsWith('/')) {
            formatted = formatted.slice(0, -1);
        }
        return formatted;
    }

    private async getApiUrl(): Promise<string> {
        const creds = await this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        return `${this.formatUrl(creds.url)}/player_api.php`;
    }

    public async login(creds: XtreamCredentials): Promise<XtreamLoginResponse> {
        const url = `${this.formatUrl(creds.url)}/player_api.php?username=${creds.username}&password=${creds.password}`;
        console.log('Attempting login to:', url);
        try {
            const response = await axios.get(url, { timeout: 10000 });
            console.log('Login response status:', response.status);
            if (response.data.user_info?.auth === 1) {
                await this.saveCredentials(creds);
            }
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error Details:', {
                    message: error.message,
                    code: error.code,
                    config: error.config?.url,
                    response: error.response?.status
                });
            } else {
                console.error('Unknown Error:', error);
            }
            throw error;
        }
    }

    public async getLiveCategories(): Promise<XtreamCategory[]> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        return this.fetchWithCache<XtreamCategory[]>(`${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_live_categories`);
    }

    public async getLiveStreams(categoryId: string = ''): Promise<XtreamStream[]> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        let url = `${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_live_streams`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }
        return this.fetchWithCache<XtreamStream[]>(url);
    }

    public async getVodCategories(): Promise<XtreamCategory[]> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        return this.fetchWithCache<XtreamCategory[]>(`${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_vod_categories`);
    }

    public async getVodStreams(categoryId: string = ''): Promise<XtreamStream[]> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        let url = `${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_vod_streams`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }
        return this.fetchWithCache<XtreamStream[]>(url);
    }

    public async getVodInfo(streamId: number): Promise<XtreamVodInfo> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        return this.fetchWithCache<XtreamVodInfo>(`${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_vod_info&vod_id=${streamId}`);
    }

    public async getSeriesCategories(): Promise<XtreamCategory[]> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        return this.fetchWithCache<XtreamCategory[]>(`${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_series_categories`);
    }

    public async getSeries(categoryId: string = ''): Promise<XtreamSeries[]> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        let url = `${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_series`;
        if (categoryId) {
            url += `&category_id=${categoryId}`;
        }
        return this.fetchWithCache<XtreamSeries[]>(url);
    }

    public async getSeriesInfo(seriesId: number): Promise<XtreamSeriesInfo> {
        const baseUrl = await this.getApiUrl();
        const creds = await this.getCredentials();
        return this.fetchWithCache<XtreamSeriesInfo>(`${baseUrl}?username=${creds!.username}&password=${creds!.password}&action=get_series_info&series_id=${seriesId}`);
    }
}

export const xtreamService = XtreamService.getInstance();

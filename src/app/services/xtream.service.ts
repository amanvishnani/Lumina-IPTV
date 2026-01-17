import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { XtreamCategory, XtreamCredentials, XtreamLoginResponse, XtreamStream, XtreamVodStream, XtreamSeries, XtreamSeriesInfo } from '../types';

@Injectable({
    providedIn: 'root'
})
export class XtreamService {
    private http = inject(HttpClient);
    private storageKey = 'xtream_credentials';

    constructor() { }

    login(credentials: XtreamCredentials): Observable<XtreamLoginResponse> {
        const { url, username, password } = credentials;
        // Xtream Codes API Login: GET /player_api.php?username=...&password=...
        const apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}`;

        return this.http.get<XtreamLoginResponse>(apiUrl).pipe(
            tap(response => {
                if (response.user_info?.auth === 1) {
                    this.saveCredentials(credentials);
                }
            })
        );
    }

    getLiveCategories(): Observable<XtreamCategory[]> {
        const creds = this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        const { url, username, password } = creds;
        const apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}&action=get_live_categories`;
        return this.http.get<XtreamCategory[]>(apiUrl);
    }

    getLiveStreams(categoryId?: string): Observable<XtreamStream[]> {
        const creds = this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        const { url, username, password } = creds;
        let apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
        if (categoryId) {
            apiUrl += `&category_id=${categoryId}`;
        }
        return this.http.get<XtreamStream[]>(apiUrl);
    }

    getVodCategories(): Observable<XtreamCategory[]> {
        const creds = this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        const { url, username, password } = creds;
        const apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`;
        return this.http.get<XtreamCategory[]>(apiUrl);
    }

    getVodStreams(categoryId?: string): Observable<XtreamVodStream[]> {
        const creds = this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        const { url, username, password } = creds;
        let apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`;
        if (categoryId) {
            apiUrl += `&category_id=${categoryId}`;
        }
        return this.http.get<XtreamVodStream[]>(apiUrl);
    }

    getSeriesCategories(): Observable<XtreamCategory[]> {
        const creds = this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        const { url, username, password } = creds;
        const apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}&action=get_series_categories`;
        return this.http.get<XtreamCategory[]>(apiUrl);
    }

    getSeries(categoryId?: string): Observable<XtreamSeries[]> {
        const creds = this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        const { url, username, password } = creds;
        let apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}&action=get_series`;
        if (categoryId) {
            apiUrl += `&category_id=${categoryId}`;
        }
        return this.http.get<XtreamSeries[]>(apiUrl);
    }

    getSeriesInfo(seriesId: number): Observable<XtreamSeriesInfo> {
        const creds = this.getCredentials();
        if (!creds) throw new Error('No credentials found');
        const { url, username, password } = creds;
        const apiUrl = `${this.formatUrl(url)}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
        return this.http.get<XtreamSeriesInfo>(apiUrl);
    }

    saveCredentials(credentials: XtreamCredentials) {
        localStorage.setItem(this.storageKey, JSON.stringify(credentials));
    }

    getCredentials(): XtreamCredentials | null {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    logout() {
        localStorage.removeItem(this.storageKey);
    }

    isLoggedIn(): boolean {
        return !!this.getCredentials();
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
}

import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { xtreamService } from './xtreamService';

export interface DownloadMetadata {
    id: string;
    streamId: number;
    title: string;
    posterUrl: string;
    fileSize: number;
    downloadedSize: number;
    status: 'downloading' | 'paused' | 'completed' | 'failed';
    filePath: string;
    extension: string;
    type: 'movie' | 'series';
    createdAt: string;
    completedAt?: string;
    error?: string;
}

class DownloadService {
    private static instance: DownloadService;
    private downloadsKey = 'downloads_metadata';
    private activeDownloads: Map<string, AbortController> = new Map();
    private CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

    private constructor() { }

    public static getInstance(): DownloadService {
        if (!DownloadService.instance) {
            DownloadService.instance = new DownloadService();
        }
        return DownloadService.instance;
    }

    private async getMetadataList(): Promise<DownloadMetadata[]> {
        const data = await AsyncStorage.getItem(this.downloadsKey);
        return data ? JSON.parse(data) : [];
    }

    private async saveMetadataList(list: DownloadMetadata[]): Promise<void> {
        await AsyncStorage.setItem(this.downloadsKey, JSON.stringify(list));
    }

    public async getDownloads(): Promise<DownloadMetadata[]> {
        return this.getMetadataList();
    }

    public async getDownload(id: string): Promise<DownloadMetadata | null> {
        const list = await this.getMetadataList();
        return list.find(d => d.id === id) || null;
    }

    private async updateDownload(id: string, updates: Partial<DownloadMetadata>): Promise<void> {
        const list = await this.getMetadataList();
        const index = list.findIndex(d => d.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates };
            await this.saveMetadataList(list);
        }
    }

    public async startDownload(
        streamId: number,
        title: string,
        posterUrl: string,
        type: 'movie' | 'series' = 'movie',
        extension: string = 'mp4',
        onProgress?: (progress: number) => void
    ): Promise<string> {
        const id = `download_${streamId}_${Date.now()}`;
        const streamUrl = await xtreamService.buildStreamUrl(streamId, type, extension);

        if (!streamUrl) {
            throw new Error('Could not build stream URL');
        }

        const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${streamId}.${extension}`;
        const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        // Create metadata
        const metadata: DownloadMetadata = {
            id,
            streamId,
            title,
            posterUrl,
            fileSize: 0,
            downloadedSize: 0,
            status: 'downloading',
            filePath,
            extension,
            type,
            createdAt: new Date().toISOString(),
        };

        const list = await this.getMetadataList();
        list.push(metadata);
        await this.saveMetadataList(list);

        // Start the background download process
        this.runDownloadLoop(id, streamUrl, filePath, 0, onProgress);

        return id;
    }

    private async runDownloadLoop(
        id: string,
        url: string,
        filePath: string,
        offset: number = 0,
        onProgress?: (progress: number) => void
    ) {
        const controller = new AbortController();
        this.activeDownloads.set(id, controller);

        try {
            // 1. Get total file size if already known from metadata
            let totalSize = 0;
            const metadata = await this.getDownload(id);
            if (metadata && metadata.fileSize > 0) {
                totalSize = metadata.fileSize;
            }

            // 2. Clear file if starting from 0
            if (offset === 0) {
                const exists = await RNFS.exists(filePath);
                if (exists) await RNFS.unlink(filePath);
            }

            let currentOffset = offset;
            let isFirstChunk = offset === 0;

            while (true) {
                if (controller.signal.aborted) break;

                const end = totalSize > 0 ? Math.min(currentOffset + this.CHUNK_SIZE - 1, totalSize - 1) : currentOffset + this.CHUNK_SIZE - 1;

                // If we reached the end
                if (totalSize > 0 && currentOffset >= totalSize) break;

                const response = await axios.get(url, {
                    headers: {
                        Range: `bytes=${currentOffset}-${end}`,
                    },
                    responseType: 'arraybuffer',
                    signal: controller.signal,
                });

                // Parse total size from content-range header if not already known
                const contentRange = response.headers['content-range'];
                if (contentRange && totalSize === 0) {
                    const parts = contentRange.split('/');
                    if (parts.length > 1) {
                        totalSize = parseInt(parts[1], 10);
                        await this.updateDownload(id, { fileSize: totalSize });
                    }
                }

                const data = response.data;
                const base64Data = this.arrayBufferToBase64(data);

                if (isFirstChunk) {
                    await RNFS.writeFile(filePath, base64Data, 'base64');
                    isFirstChunk = false;
                } else {
                    await RNFS.appendFile(filePath, base64Data, 'base64');
                }

                currentOffset += data.byteLength;

                // Update progress
                await this.updateDownload(id, { downloadedSize: currentOffset });
                if (totalSize > 0) {
                    onProgress?.(currentOffset / totalSize);
                }

                // If server didn't provide total size and returned less than chunk size, we might be done
                if (totalSize === 0 && data.byteLength < this.CHUNK_SIZE) break;
            }

            if (!controller.signal.aborted) {
                await this.updateDownload(id, {
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    downloadedSize: currentOffset,
                    fileSize: totalSize > 0 ? totalSize : currentOffset
                });
                this.activeDownloads.delete(id);
            }

        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Download cancelled/paused');
            } else {
                const axiosError = error as AxiosError;
                console.error('Download error:', axiosError.message);
                await this.updateDownload(id, {
                    status: 'failed',
                    error: axiosError.message
                });
                this.activeDownloads.delete(id);
            }
        }
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        // Manual base64 implementation to avoid btoa dependency in React Native
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let base64 = '';
        let i = 0;
        while (i < binary.length) {
            const b1 = binary.charCodeAt(i++) & 0xFF;
            const b2 = i < binary.length ? binary.charCodeAt(i++) & 0xFF : NaN;
            const b3 = i < binary.length ? binary.charCodeAt(i++) & 0xFF : NaN;

            base64 += chars.charAt(b1 >> 2);
            base64 += chars.charAt(((b1 & 0x03) << 4) | (b2 >> 4));
            base64 += isNaN(b2) ? '=' : chars.charAt(((b2 & 0x0F) << 2) | (b3 >> 6));
            base64 += isNaN(b3) ? '=' : chars.charAt(b3 & 0x3F);
        }
        return base64;
    }

    public async pauseDownload(id: string): Promise<void> {
        const controller = this.activeDownloads.get(id);
        if (controller) {
            controller.abort();
            this.activeDownloads.delete(id);
            await this.updateDownload(id, { status: 'paused' });
        }
    }

    public async resumeDownload(
        id: string,
        onProgress?: (progress: number) => void
    ): Promise<void> {
        const metadata = await this.getDownload(id);
        if (!metadata || (metadata.status !== 'paused' && metadata.status !== 'failed')) {
            throw new Error('Download not found or not in a resumable state');
        }

        const streamUrl = await xtreamService.buildStreamUrl(
            metadata.streamId,
            metadata.type,
            metadata.extension
        );

        if (!streamUrl) {
            throw new Error('Could not build stream URL');
        }

        await this.updateDownload(id, { status: 'downloading', error: undefined });
        this.runDownloadLoop(id, streamUrl, metadata.filePath, metadata.downloadedSize, onProgress);
    }

    public async cancelDownload(id: string): Promise<void> {
        const controller = this.activeDownloads.get(id);
        if (controller) {
            controller.abort();
            this.activeDownloads.delete(id);
        }

        const metadata = await this.getDownload(id);
        if (metadata) {
            const exists = await RNFS.exists(metadata.filePath);
            if (exists) {
                await RNFS.unlink(metadata.filePath);
            }

            const list = await this.getMetadataList();
            const filtered = list.filter(d => d.id !== id);
            await this.saveMetadataList(filtered);
        }
    }

    public async deleteDownload(id: string): Promise<void> {
        await this.cancelDownload(id);
    }

    public async getTotalDownloadedSize(): Promise<number> {
        const list = await this.getMetadataList();
        return list
            .filter(d => d.status === 'completed')
            .reduce((sum, d) => sum + d.fileSize, 0);
    }

    public async clearAllDownloads(): Promise<void> {
        const list = await this.getMetadataList();
        for (const download of list) {
            await this.cancelDownload(download.id);
        }
        await AsyncStorage.removeItem(this.downloadsKey);
    }
}

export const downloadService = DownloadService.getInstance();

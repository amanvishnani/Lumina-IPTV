import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { downloadService, DownloadMetadata } from '../services/downloadService';
import { responsiveFontSize, spacing, moderateScale, getGridColumns } from '../utils/responsive';
import { showPlayerPicker } from '../utils/playerUtils';

const DownloadsScreen = () => {
    const [downloads, setDownloads] = useState<DownloadMetadata[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadDownloads = useCallback(async () => {
        const list = await downloadService.getDownloads();
        setDownloads(list.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
    }, []);

    useEffect(() => {
        loadDownloads();
        const interval = setInterval(loadDownloads, 2000); // Refresh every 2s for progress
        return () => clearInterval(interval);
    }, [loadDownloads]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDownloads();
        setRefreshing(false);
    };

    const handlePlay = async (download: DownloadMetadata) => {
        // Allow playing if download has at least some data
        if (download.downloadedSize === 0) {
            Alert.alert('Not Ready', 'Wait for the download to start before playing.');
            return;
        }

        showPlayerPicker(
            download.id,
            download.type as 'movie' | 'series',
            'mp4',
            download.filePath
        );
    };

    const handlePauseResume = async (download: DownloadMetadata) => {
        if (download.status === 'downloading') {
            await downloadService.pauseDownload(download.id);
        } else if (download.status === 'paused' || download.status === 'failed') {
            await downloadService.resumeDownload(download.id);
        }
        await loadDownloads();
    };

    const handleDelete = (download: DownloadMetadata) => {
        Alert.alert(
            'Delete Download',
            `Are you sure you want to delete "${download.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await downloadService.deleteDownload(download.id);
                        await loadDownloads();
                    },
                },
            ]
        );
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const getProgress = (download: DownloadMetadata): number => {
        if (download.fileSize === 0) return 0;
        return download.downloadedSize / download.fileSize;
    };

    const renderDownloadItem = ({ item }: { item: DownloadMetadata }) => {
        const progress = getProgress(item);

        return (
            <View style={styles.downloadItem}>
                <Image source={{ uri: item.posterUrl }} style={styles.poster} />

                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                    {item.status === 'completed' && (
                        <Text style={styles.statusText}>
                            ✓ Downloaded • {formatFileSize(item.fileSize)}
                        </Text>
                    )}

                    {(item.status === 'downloading' || item.status === 'paused') && (
                        <>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                            </View>
                            <Text style={styles.progressText}>
                                {item.status === 'paused' ? 'Paused • ' : ''}
                                {formatFileSize(item.downloadedSize)} / {formatFileSize(item.fileSize)}
                                {' • '}{Math.round(progress * 100)}%
                            </Text>
                        </>
                    )}

                    {item.status === 'failed' && (
                        <View>
                            <Text style={styles.failedText}>✗ Download Failed</Text>
                            {item.error && (
                                <Text style={styles.errorDetailText} numberOfLines={1}>
                                    {item.error}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.actions}>
                    {item.status !== 'failed' && (
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={() => handlePlay(item)}
                        >
                            <Text style={styles.playButtonText}>▶</Text>
                        </TouchableOpacity>
                    )}

                    {(item.status === 'downloading' || item.status === 'paused' || item.status === 'failed') && (
                        <TouchableOpacity
                            style={styles.pauseButton}
                            onPress={() => handlePauseResume(item)}
                        >
                            <Text style={styles.pauseButtonText}>
                                {item.status === 'downloading' ? '⏸' : item.status === 'failed' ? '🔄' : '▶'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item)}
                    >
                        <Text style={styles.deleteButtonText}>🗑</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📥</Text>
            <Text style={styles.emptyTitle}>No Downloads</Text>
            <Text style={styles.emptyText}>
                Downloaded movies will appear here.{'\n'}
                Tap the download button on any movie to get started.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Downloads</Text>
            </View>

            <FlatList
                data={downloads}
                renderItem={renderDownloadItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={downloads.length === 0 ? styles.emptyContainer : styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(20),
        fontWeight: 'bold',
    },
    listContent: {
        padding: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
        fontSize: responsiveFontSize(64),
        marginBottom: spacing.md,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(20),
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    emptyText: {
        color: '#888',
        fontSize: responsiveFontSize(14),
        textAlign: 'center',
        lineHeight: 22,
    },
    downloadItem: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderRadius: moderateScale(10),
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: '#333',
    },
    poster: {
        width: moderateScale(60),
        height: moderateScale(90),
        borderRadius: moderateScale(6),
        backgroundColor: '#333',
    },
    info: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: responsiveFontSize(15),
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    statusText: {
        color: '#4CAF50',
        fontSize: responsiveFontSize(12),
    },
    progressBar: {
        height: moderateScale(4),
        backgroundColor: '#333',
        borderRadius: moderateScale(2),
        overflow: 'hidden',
        marginVertical: spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
    },
    progressText: {
        color: '#888',
        fontSize: responsiveFontSize(11),
    },
    failedText: {
        color: '#FF3B30',
        fontSize: responsiveFontSize(12),
        fontWeight: 'bold',
    },
    errorDetailText: {
        color: '#888',
        fontSize: responsiveFontSize(10),
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    playButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(16),
    },
    pauseButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pauseButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(16),
    },
    deleteButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: responsiveFontSize(16),
    },
});

export default DownloadsScreen;

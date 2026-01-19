import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    FlatList,
    Alert,
} from 'react-native';
import { xtreamService } from '../services/xtreamService';
import { downloadService, DownloadMetadata } from '../services/downloadService';
import { XtreamSeriesInfo, XtreamEpisode } from '../types';
import { showPlayerPicker } from '../utils/playerUtils';
import { responsiveFontSize, spacing, moderateScale } from '../utils/responsive';

const SeriesDetailsScreen = ({ route, navigation }: any) => {
    const { seriesId } = route.params;
    const [seriesInfo, setSeriesInfo] = useState<XtreamSeriesInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [activeDownloads, setActiveDownloads] = useState<DownloadMetadata[]>([]);

    const fetchSeriesInfo = async () => {
        setLoading(true);
        try {
            const info = await xtreamService.getSeriesInfo(seriesId);
            setSeriesInfo(info);
            if (info?.seasons?.length > 0) {
                // Find first season number safely
                const firstSeason = info.seasons[0].season_number || Object.keys(info.episodes || {})[0] || 1;
                setSelectedSeason(Number(firstSeason));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadDownloads = useCallback(async () => {
        const list = await downloadService.getDownloads();
        setActiveDownloads(list.filter(d => d.type === 'series'));
    }, []);

    useEffect(() => {
        fetchSeriesInfo();
    }, [seriesId]);

    useEffect(() => {
        loadDownloads();
        const interval = setInterval(loadDownloads, 2000);
        return () => clearInterval(interval);
    }, [loadDownloads]);

    const handleDownload = async (episode: XtreamEpisode) => {
        try {
            const title = `${seriesInfo?.info?.name} - S${episode.season}E${episode.episode_num}: ${episode.title}`;
            await downloadService.startDownload(
                Number(episode.id),
                title,
                seriesInfo?.info?.cover || '',
                'series',
                episode.container_extension || 'mp4'
            );
            loadDownloads();
        } catch (error: any) {
            Alert.alert('Download Error', error.message);
        }
    };

    const handleCancelDownload = async (downloadId: string) => {
        await downloadService.cancelDownload(downloadId);
        loadDownloads();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!seriesInfo) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Failed to load series details.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const info = seriesInfo.info || {};
    const episodes = seriesInfo.episodes || {};
    const seasons = seriesInfo.seasons || [];
    const currentEpisodes = episodes[selectedSeason.toString()] || [];

    const getEpisodeDownload = (episodeId: string) => {
        return activeDownloads.find(d => d.streamId === Number(episodeId));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image
                    source={{ uri: info.backdrop_path?.[0] || info.cover }}
                    style={styles.backdrop}
                />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Image source={{ uri: info.cover }} style={styles.poster} />
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{info.name || 'Unknown Series'}</Text>
                            <Text style={styles.meta}>
                                {info.releaseDate} {info.releaseDate && '•'} ⭐ {info.rating}
                            </Text>
                            <Text style={styles.genre}>{info.genre}</Text>
                        </View>
                    </View>

                    <View style={styles.details}>
                        <Text style={styles.sectionTitle}>Storyline</Text>
                        <Text style={styles.plot}>{info.plot || 'No storyline available.'}</Text>
                    </View>

                    {seasons.length > 0 && (
                        <View style={styles.seasonSelector}>
                            <Text style={styles.sectionTitle}>Seasons</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {seasons.map((s: any) => (
                                    <TouchableOpacity
                                        key={s.season_number}
                                        style={[
                                            styles.seasonBadge,
                                            selectedSeason === s.season_number && styles.seasonBadgeActive,
                                        ]}
                                        onPress={() => setSelectedSeason(s.season_number)}
                                    >
                                        <Text style={[
                                            styles.seasonBadgeText,
                                            selectedSeason === s.season_number && styles.seasonBadgeTextActive,
                                        ]}>
                                            Season {s.season_number}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.episodeList}>
                        <Text style={styles.sectionTitle}>Episodes</Text>
                        {currentEpisodes.length === 0 ? (
                            <Text style={styles.epMeta}>No episodes found for this season.</Text>
                        ) : (
                            currentEpisodes.map((ep: XtreamEpisode) => {
                                const download = getEpisodeDownload(ep.id);
                                const isDownloading = download?.status === 'downloading';
                                const isCompleted = download?.status === 'completed';
                                const isFailed = download?.status === 'failed';
                                const progress = download && download.fileSize > 0
                                    ? download.downloadedSize / download.fileSize
                                    : 0;

                                return (
                                    <View key={ep.id} style={styles.episodeCard}>
                                        <TouchableOpacity
                                            style={styles.epMainInfo}
                                            onPress={() => showPlayerPicker(
                                                ep.id,
                                                'series',
                                                ep.container_extension || 'mp4',
                                                download?.downloadedSize && download.downloadedSize > 0 ? download.filePath : undefined
                                            )}
                                        >
                                            <View style={styles.epNumContainer}>
                                                <Text style={styles.epNum}>{ep.episode_num}</Text>
                                            </View>
                                            <View style={styles.epInfo}>
                                                <Text style={styles.epTitle} numberOfLines={1}>{ep.title}</Text>
                                                {isDownloading ? (
                                                    <View style={styles.downloadProgressContainer}>
                                                        <View style={styles.progressBar}>
                                                            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                                                        </View>
                                                        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                                                    </View>
                                                ) : isFailed ? (
                                                    <Text style={[styles.epMeta, { color: '#FF3B30' }]}>
                                                        ⚠ Failed. Tap icon to retry.
                                                    </Text>
                                                ) : (
                                                    <Text style={styles.epMeta}>
                                                        {isCompleted ? '✓ Downloaded' : 'Tap to play'}
                                                    </Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.downloadButton,
                                                isDownloading && styles.downloadButtonActive,
                                                isCompleted && styles.downloadButtonCompleted,
                                                isFailed && styles.downloadButtonFailed
                                            ]}
                                            onPress={() => {
                                                if (isDownloading) {
                                                    handleCancelDownload(download.id);
                                                } else if (isFailed) {
                                                    downloadService.resumeDownload(download.id).then(() => loadDownloads());
                                                } else if (!isCompleted) {
                                                    handleDownload(ep);
                                                }
                                            }}
                                            disabled={isCompleted}
                                        >
                                            <Text style={styles.downloadIcon}>
                                                {isDownloading ? '✕' : isCompleted ? '✓' : isFailed ? '🔄' : '📥'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.playIconButton}
                                            onPress={() => showPlayerPicker(
                                                ep.id,
                                                'series',
                                                ep.container_extension || 'mp4',
                                                download?.downloadedSize && download.downloadedSize > 0 ? download.filePath : undefined
                                            )}
                                        >
                                            <Text style={styles.playIcon}>▶</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fabBack} onPress={() => navigation.goBack()}>
                <Text style={styles.fabBackText}>←</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: spacing.xl,
    },
    backdrop: {
        width: '100%',
        height: moderateScale(250),
        opacity: 0.6,
    },
    content: {
        padding: spacing.lg,
        marginTop: -moderateScale(50),
    },
    header: {
        flexDirection: 'row',
    },
    poster: {
        width: moderateScale(100),
        height: moderateScale(150),
        borderRadius: moderateScale(8),
        borderWidth: 2,
        borderColor: '#333',
    },
    headerInfo: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'flex-end',
        paddingBottom: spacing.sm,
    },
    title: {
        color: '#fff',
        fontSize: responsiveFontSize(22),
        fontWeight: 'bold',
    },
    meta: {
        color: '#aaa',
        fontSize: responsiveFontSize(14),
        marginTop: spacing.xs,
    },
    genre: {
        color: '#007AFF',
        fontSize: responsiveFontSize(14),
        marginTop: spacing.xxs,
    },
    details: {
        marginTop: spacing.xl,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(18),
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    plot: {
        color: '#ccc',
        fontSize: responsiveFontSize(15),
        lineHeight: 22,
    },
    seasonSelector: {
        marginTop: spacing.xl,
    },
    seasonBadge: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: moderateScale(20),
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: '#333',
    },
    seasonBadgeActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    seasonBadgeText: {
        color: '#888',
        fontWeight: '600',
        fontSize: responsiveFontSize(13),
    },
    seasonBadgeTextActive: {
        color: '#fff',
    },
    episodeList: {
        marginTop: spacing.xl,
        paddingBottom: spacing.xl * 2,
    },
    episodeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: spacing.md,
        borderRadius: moderateScale(10),
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#333',
    },
    epMainInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    epNumContainer: {
        width: moderateScale(30),
        alignItems: 'center',
    },
    epNum: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: responsiveFontSize(16),
    },
    epInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    epTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(15),
        fontWeight: '500',
    },
    epMeta: {
        color: '#666',
        fontSize: responsiveFontSize(11),
        marginTop: 2,
    },
    downloadProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    progressBar: {
        flex: 1,
        height: moderateScale(4),
        backgroundColor: '#333',
        borderRadius: moderateScale(2),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
    },
    progressText: {
        color: '#007AFF',
        fontSize: responsiveFontSize(10),
        marginLeft: 8,
        fontWeight: 'bold',
    },
    downloadButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.xs,
    },
    downloadButtonActive: {
        backgroundColor: '#FF3B30',
    },
    downloadButtonCompleted: {
        backgroundColor: '#1a1a1a',
    },
    downloadButtonFailed: {
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    downloadIcon: {
        color: '#fff',
        fontSize: responsiveFontSize(14),
    },
    playIconButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.xs,
    },
    playIcon: {
        color: '#fff',
        fontSize: responsiveFontSize(14),
    },
    fabBack: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    fabBackText: {
        color: '#fff',
        fontSize: responsiveFontSize(24),
    },
    errorText: {
        color: '#FF3B30',
        fontSize: responsiveFontSize(16),
        marginBottom: spacing.md,
    },
    backButton: {
        padding: spacing.md,
        backgroundColor: '#333',
        borderRadius: moderateScale(8),
    },
    backButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(14),
    },
});

export default SeriesDetailsScreen;

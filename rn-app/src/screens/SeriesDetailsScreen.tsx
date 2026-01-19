import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { xtreamService } from '../services/xtreamService';
import { XtreamSeriesInfo, XtreamEpisode } from '../types';
import { playInExternalPlayer } from '../utils/playerUtils';

const SeriesDetailsScreen = ({ route, navigation }: any) => {
    const { seriesId } = route.params;
    const [seriesInfo, setSeriesInfo] = useState<XtreamSeriesInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);

    useEffect(() => {
        fetchSeriesInfo();
    }, [seriesId]);

    const fetchSeriesInfo = async () => {
        setLoading(true);
        try {
            const info = await xtreamService.getSeriesInfo(seriesId);
            setSeriesInfo(info);
            if (info?.seasons?.length > 0) {
                setSelectedSeason(info.seasons[0].season_number || 1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
                            currentEpisodes.map((ep: XtreamEpisode) => (
                                <TouchableOpacity
                                    key={ep.id}
                                    style={styles.episodeCard}
                                    onPress={() => playInExternalPlayer(
                                        ep.id,
                                        'series',
                                        ep.container_extension || 'mp4'
                                    )}
                                >
                                    <View style={styles.epNumContainer}>
                                        <Text style={styles.epNum}>{ep.episode_num}</Text>
                                    </View>
                                    <View style={styles.epInfo}>
                                        <Text style={styles.epTitle} numberOfLines={1}>{ep.title}</Text>
                                        <Text style={styles.epMeta}>Tap to play</Text>
                                    </View>
                                    <Text style={styles.playIcon}>▶</Text>
                                </TouchableOpacity>
                            ))
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
        padding: 20,
    },
    backdrop: {
        width: '100%',
        height: 250,
        opacity: 0.6,
    },
    content: {
        padding: 20,
        marginTop: -50,
    },
    header: {
        flexDirection: 'row',
    },
    poster: {
        width: 100,
        height: 150,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#333',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'flex-end',
        paddingBottom: 10,
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    meta: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 5,
    },
    genre: {
        color: '#007AFF',
        fontSize: 14,
        marginTop: 3,
    },
    details: {
        marginTop: 30,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    plot: {
        color: '#ccc',
        fontSize: 15,
        lineHeight: 22,
    },
    seasonSelector: {
        marginTop: 30,
    },
    seasonBadge: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
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
    },
    seasonBadgeTextActive: {
        color: '#fff',
    },
    episodeList: {
        marginTop: 30,
        paddingBottom: 40,
    },
    episodeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    epNumContainer: {
        width: 30,
        alignItems: 'center',
    },
    epNum: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    epInfo: {
        flex: 1,
        marginLeft: 15,
    },
    epTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    epMeta: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    playIcon: {
        color: '#fff',
        fontSize: 20,
        marginLeft: 10,
    },
    fabBack: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    fabBackText: {
        color: '#fff',
        fontSize: 24,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 16,
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default SeriesDetailsScreen;

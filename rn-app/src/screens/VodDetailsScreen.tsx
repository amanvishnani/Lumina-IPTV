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
    Linking,
    Alert,
} from 'react-native';
import { xtreamService } from '../services/xtreamService';
import { XtreamVodInfo } from '../types';

const VodDetailsScreen = ({ route, navigation }: any) => {
    const { streamId } = route.params;
    const [movieInfo, setMovieInfo] = useState<XtreamVodInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovieInfo();
    }, [streamId]);

    const fetchMovieInfo = async () => {
        setLoading(true);
        try {
            const info = await xtreamService.getVodInfo(streamId);
            setMovieInfo(info);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!movieInfo) return;
        const creds = await xtreamService.getCredentials();
        if (!creds) return;

        const streamData = movieInfo.movie_data;
        if (!streamData) {
            Alert.alert('Error', 'Stream information not available.');
            return;
        }

        const extension = streamData.container_extension || 'mp4';
        const streamUrl = `${creds.url}/movie/${creds.username}/${creds.password}/${streamData.stream_id}.${extension}`;

        Linking.openURL(streamUrl);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!movieInfo || !movieInfo.info) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Failed to load movie details.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { info, movie_data } = movieInfo;

    const getBackdropUrl = () => {
        if (info.backdrop_path && info.backdrop_path.length > 0) {
            return info.backdrop_path[0];
        }
        if (info.backdrop) {
            const urls = info.backdrop.split(/\r?\n/).filter(url => url.trim().length > 0);
            if (urls.length > 0) return urls[0].trim();
        }
        return info.movie_image;
    };

    const displayYear = info.releasedate ? info.releasedate.split('-')[0] : '';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image
                    source={{ uri: getBackdropUrl() }}
                    style={styles.backdrop}
                />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Image source={{ uri: info.movie_image }} style={styles.poster} />
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{movie_data.name}</Text>
                            <Text style={styles.meta}>
                                {displayYear} {displayYear && '•'} {info.genre} {info.genre && '•'} ⭐ {info.rating}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={() => navigation.navigate('Player', {
                                streamId: movie_data.stream_id,
                                streamType: 'movie',
                                extension: movie_data.container_extension || 'mp4'
                            })}
                        >
                            <Text style={styles.playButtonText}>Play</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                            <Text style={styles.downloadButtonText}>Download</Text>
                        </TouchableOpacity>
                    </View>

                    {info.youtube_trailer && (
                        <TouchableOpacity
                            style={styles.trailerButton}
                            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${info.youtube_trailer}`)}
                        >
                            <Text style={styles.trailerButtonText}>View Trailer</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.details}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <Text style={styles.plot}>{info.plot || 'No description available.'}</Text>

                        {info.releasedate && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Release</Text>
                                <Text style={styles.infoValue}>{info.releasedate}</Text>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Director</Text>
                            <Text style={styles.infoValue}>{info.director || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Cast</Text>
                            <Text style={styles.infoValue}>{info.cast || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Runtime</Text>
                            <Text style={styles.infoValue}>{info.duration || 'N/A'}</Text>
                        </View>
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
    actions: {
        flexDirection: 'row',
        marginTop: 25,
        gap: 15,
    },
    playButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    playButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    downloadButton: {
        flex: 1,
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    trailerButton: {
        backgroundColor: '#FF0000',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    trailerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    details: {
        marginTop: 30,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    plot: {
        color: '#ccc',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoLabel: {
        color: '#888',
        width: 80,
        fontSize: 14,
    },
    infoValue: {
        color: '#fff',
        flex: 1,
        fontSize: 14,
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

export default VodDetailsScreen;

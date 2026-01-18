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

        const extension = movieInfo.movie_data.container_extension || 'mp4';
        const streamUrl = `${creds.url}/movie/${creds.username}/${creds.password}/${movieInfo.movie_data.stream_id}.${extension}`;

        Linking.openURL(streamUrl);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!movieInfo) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Failed to load movie details.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const movieData = movieInfo.info.movie_data;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image
                    source={{ uri: movieData.backdrop_path?.[0] || movieData.stream_icon }}
                    style={styles.backdrop}
                />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Image source={{ uri: movieData.stream_icon }} style={styles.poster} />
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{movieData.name}</Text>
                            <Text style={styles.meta}>
                                {movieData.year} • {movieData.genre} • ⭐ {movieData.rating}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={() => navigation.navigate('Player', {
                                streamId: movieInfo.movie_data.stream_id,
                                streamType: 'movie',
                                extension: movieInfo.movie_data.container_extension
                            })}
                        >
                            <Text style={styles.playButtonText}>Play</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                            <Text style={styles.downloadButtonText}>Download</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.details}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <Text style={styles.plot}>{movieData.plot || movieData.description}</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Director</Text>
                            <Text style={styles.infoValue}>{movieData.director}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Cast</Text>
                            <Text style={styles.infoValue}>{movieData.cast || movieData.actors}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Runtime</Text>
                            <Text style={styles.infoValue}>{movieData.duration}</Text>
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

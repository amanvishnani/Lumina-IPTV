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
import { playInExternalPlayer } from '../utils/playerUtils';
import { responsiveFontSize, spacing, moderateScale } from '../utils/responsive';

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

    const formatAudioInfo = () => {
        if (!movieInfo?.info?.audio) return 'Not available';
        const audio = movieInfo.info.audio;
        const codec = audio.codec_name?.toUpperCase() || 'Unknown';
        const channels = audio.channels || 0;
        const channelLayout = audio.channel_layout || '';

        let channelDesc = '';
        if (channels === 1) channelDesc = 'Mono';
        else if (channels === 2) channelDesc = 'Stereo';
        else if (channels === 6) channelDesc = '5.1 Surround';
        else if (channels === 8) channelDesc = '7.1 Surround';
        else if (channelLayout) channelDesc = channelLayout;
        else channelDesc = `${channels} channels`;

        return `${codec} ${channelDesc}`;
    };

    const formatVideoInfo = () => {
        if (!movieInfo?.info?.video) return 'Not available';
        const video = movieInfo.info.video;
        const codec = video.codec_name?.toUpperCase() || 'Unknown';
        const width = video.width || 0;
        const height = video.height || 0;
        const resolution = width && height ? `${width}x${height}` : '';

        let quality = '';
        if (height >= 2160) quality = '4K';
        else if (height >= 1080) quality = '1080p';
        else if (height >= 720) quality = '720p';
        else if (height >= 480) quality = '480p';

        return `${codec} ${quality || resolution}`;
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
                            onPress={() => playInExternalPlayer(
                                movie_data.stream_id,
                                'movie',
                                movie_data.container_extension || 'mp4'
                            )}
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

                        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Technical Details</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Audio</Text>
                            <Text style={styles.infoValue}>{formatAudioInfo()}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Video</Text>
                            <Text style={styles.infoValue}>{formatVideoInfo()}</Text>
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
        height: moderateScale(250),
        opacity: 0.6,
    },
    content: {
        padding: spacing.md,
        marginTop: moderateScale(-50),
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
    actions: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        gap: spacing.md,
    },
    playButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: spacing.sm + 4,
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    playButtonText: {
        color: '#000',
        fontSize: responsiveFontSize(16),
        fontWeight: 'bold',
    },
    downloadButton: {
        flex: 1,
        backgroundColor: '#333',
        padding: spacing.sm + 4,
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(16),
        fontWeight: 'bold',
    },
    trailerButton: {
        backgroundColor: '#FF0000',
        padding: spacing.sm + 4,
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: spacing.md,
    },
    trailerButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(16),
        fontWeight: 'bold',
    },
    details: {
        marginTop: spacing.xl,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(18),
        fontWeight: 'bold',
        marginBottom: spacing.sm,
    },
    plot: {
        color: '#ccc',
        fontSize: responsiveFontSize(15),
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    infoLabel: {
        color: '#888',
        width: moderateScale(80),
        fontSize: responsiveFontSize(14),
    },
    infoValue: {
        color: '#fff',
        flex: 1,
        fontSize: responsiveFontSize(14),
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

import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    TouchableWithoutFeedback,
} from 'react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';
import Slider from '@react-native-community/slider';
import { xtreamService } from '../services/xtreamService';

const PlayerScreen = ({ route, navigation }: any) => {
    const { streamId, streamType, extension } = route.params;
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const vlcRef = useRef<any>(null);
    const controlsTimer = useRef<any>(null);

    useEffect(() => {
        prepareStream();
        StatusBar.setHidden(true);
        resetControlsTimer();

        return () => {
            StatusBar.setHidden(false);
            if (controlsTimer.current) clearTimeout(controlsTimer.current);
        };
    }, []);

    const prepareStream = async () => {
        const creds = await xtreamService.getCredentials();
        if (!creds) return;

        let url = '';
        if (streamType === 'live') {
            url = `${creds.url}/${creds.username}/${creds.password}/${streamId}.m3u8`;
        } else if (streamType === 'movie') {
            url = `${creds.url}/movie/${creds.username}/${creds.password}/${streamId}.${extension || 'mp4'}`;
        } else if (streamType === 'series') {
            url = `${creds.url}/series/${creds.username}/${creds.password}/${streamId}.${extension || 'mp4'}`;
        }
        setStreamUrl(url);
    };

    const resetControlsTimer = () => {
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
        setShowControls(true);
        controlsTimer.current = setTimeout(() => {
            setShowControls(false);
        }, 5000);
    };

    const togglePlayPause = () => {
        setIsPaused(!isPaused);
        resetControlsTimer();
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (value: number) => {
        setCurrentTime(value);
    };

    const handleSlidingComplete = (value: number) => {
        seekTo(value);
        resetControlsTimer();
    };

    const seekTo = (ms: number) => {
        if (duration > 0) {
            const position = ms / duration;
            vlcRef.current?.seek(position);
            setCurrentTime(ms);
        }
    };

    const jump = (delta: number) => {
        const newTime = Math.max(0, Math.min(duration, currentTime + delta * 1000));
        seekTo(newTime);
        resetControlsTimer();
    };

    if (!streamUrl) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={resetControlsTimer}>
            <View style={styles.container}>
                <VLCPlayer
                    ref={vlcRef}
                    source={{ uri: streamUrl }}
                    style={styles.fullScreen}
                    paused={isPaused}
                    autoplay={true}
                    videoAspectRatio="16:9"
                    onProgress={(e: any) => {
                        setCurrentTime(e.currentTime);
                        setDuration(e.duration);
                    }}
                    onError={(e: any) => console.error('VLC Error:', e)}
                    onEnd={() => navigation.goBack()}
                />

                {showControls && (
                    <View style={styles.controlsContainer}>
                        {/* Top Bar */}
                        <View style={styles.topBar}>
                            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.iconText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.streamTitle} numberOfLines={1}>
                                {streamType.toUpperCase()} {streamId}
                            </Text>
                        </View>

                        {/* Middle Controls */}
                        <View style={styles.middleControls}>
                            <TouchableOpacity style={styles.skipButton} onPress={() => jump(-15)}>
                                <Text style={styles.skipText}>-15s</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.playIconButton} onPress={togglePlayPause}>
                                <Text style={styles.playPauseIcon}>{isPaused ? '▶' : '⏸'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.skipButton} onPress={() => jump(15)}>
                                <Text style={styles.skipText}>+15s</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Bar */}
                        <View style={styles.bottomBar}>
                            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={duration}
                                value={currentTime}
                                onValueChange={handleSeek}
                                onSlidingComplete={handleSlidingComplete}
                                minimumTrackTintColor="#007AFF"
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor="#007AFF"
                            />
                            <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    fullScreen: {
        width: '100%',
        height: '100%',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    controlsContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
        padding: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 10,
    },
    iconText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    },
    streamTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1,
    },
    middleControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 60,
    },
    playIconButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    playPauseIcon: {
        color: '#fff',
        fontSize: 40,
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 15,
        borderRadius: 12,
    },
    timeText: {
        color: '#fff',
        fontSize: 14,
        width: 60,
        textAlign: 'center',
    },
    slider: {
        flex: 1,
        height: 40,
    },
});

export default PlayerScreen;

import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { BlurView } from '@react-native-community/blur';
import Slider from '@react-native-community/slider';
import { xtreamService } from '../services/xtreamService';
import {
    getScreenDimensions,
    moderateScale,
    responsiveFontSize,
    spacing,
    getSafeAreaPadding,
    responsiveValue
} from '../utils/responsive';




const PlayerScreen = ({ route, navigation }: any) => {
    const { streamId, streamType, extension } = route.params;
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const vlcRef = useRef<any>(null);
    const controlsTimer = useRef<any>(null);
    const opacityAnim = useRef(new Animated.Value(1)).current;

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
        if (!showControls) {
            setShowControls(true);
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }

        controlsTimer.current = setTimeout(() => {
            hideControls();
        }, 5000);
    };

    const hideControls = () => {
        Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
        }).start(() => setShowControls(false));
    };

    const toggleControls = () => {
        if (showControls) {
            hideControls();
            if (controlsTimer.current) clearTimeout(controlsTimer.current);
        } else {
            resetControlsTimer();
        }
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
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={toggleControls}>
                <View style={styles.playerWrapper}>
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
                </View>
            </TouchableWithoutFeedback>

            {showControls && (
                <Animated.View
                    style={[styles.controlsOverlay, { opacity: opacityAnim }]}
                    pointerEvents="box-none"
                >
                    {/* Floating Top Bar */}
                    <View style={styles.topContainer}>
                        <BlurView style={styles.topPill} blurType="dark" blurAmount={15} reducedTransparencyFallbackColor="black">
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.backButtonText}>✕</Text>
                            </TouchableOpacity>
                            <View style={styles.titleWrapper}>
                                <Text style={styles.streamTitle} numberOfLines={1}>
                                    {streamType.toUpperCase()}
                                </Text>
                            </View>
                        </BlurView>
                    </View>

                    {/* Middle Controls - Floating Circle Islands */}
                    <View style={styles.midContainer}>
                        <BlurView style={styles.skipPill} blurType="dark" blurAmount={20}>
                            <TouchableOpacity style={styles.midButton} onPress={() => jump(-15)}>
                                <Text style={styles.midButtonText}>↺</Text>
                                <Text style={styles.skipLabel}>15</Text>
                            </TouchableOpacity>
                        </BlurView>

                        <BlurView style={styles.playPill} blurType="dark" blurAmount={25}>
                            <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
                                <Text style={styles.playPauseIcon}>{isPaused ? '▶' : '⏸'}</Text>
                            </TouchableOpacity>
                        </BlurView>

                        <BlurView style={styles.skipPill} blurType="dark" blurAmount={20}>
                            <TouchableOpacity style={styles.midButton} onPress={() => jump(15)}>
                                <Text style={styles.midButtonText}>↻</Text>
                                <Text style={styles.skipLabel}>15</Text>
                            </TouchableOpacity>
                        </BlurView>
                    </View>

                    {/* Floating Bottom Slider Bar */}
                    <View style={styles.bottomContainer}>
                        <BlurView style={styles.bottomPill} blurType="dark" blurAmount={20}>
                            <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={duration}
                                value={currentTime}
                                onValueChange={handleSeek}
                                onSlidingComplete={handleSlidingComplete}
                                minimumTrackTintColor="#FFF"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="#FFF"
                            />
                            <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
                        </BlurView>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    playerWrapper: {
        flex: 1,
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
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingVertical: getSafeAreaPadding().vertical,
        paddingHorizontal: getSafeAreaPadding().horizontal,
    },
    // Top Bar Styles
    topContainer: {
        alignItems: 'center',
    },
    topPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: moderateScale(30),
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    backButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(18),
        fontWeight: '200',
    },
    titleWrapper: {
        paddingHorizontal: spacing.md,
        maxWidth: responsiveValue(250, 400),
    },
    streamTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(14),
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    // Mid Controls Styles
    midContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: responsiveValue(30, 50),
    },
    skipPill: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    midButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    midButtonText: {
        color: '#fff',
        fontSize: responsiveFontSize(24),
    },
    skipLabel: {
        color: '#fff',
        fontSize: responsiveFontSize(10),
        fontWeight: 'bold',
        marginTop: -2,
    },
    playPill: {
        width: moderateScale(90),
        height: moderateScale(90),
        borderRadius: moderateScale(45),
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    playPauseButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playPauseIcon: {
        color: '#fff',
        fontSize: responsiveFontSize(44),
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    // Bottom Bar Styles
    bottomContainer: {
        alignItems: 'center',
    },
    bottomPill: {
        width: responsiveValue('90%', '70%'),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: moderateScale(30),
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    timeLabel: {
        color: '#fff',
        fontSize: responsiveFontSize(12),
        fontWeight: '500',
        width: moderateScale(50),
        textAlign: 'center',
    },
    slider: {
        flex: 1,
        height: moderateScale(40),
        marginHorizontal: spacing.sm,
    },
});

export default PlayerScreen;

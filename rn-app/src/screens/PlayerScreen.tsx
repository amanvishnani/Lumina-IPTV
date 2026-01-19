import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { xtreamService } from '../services/xtreamService';

const PlayerScreen = ({ route, navigation }: any) => {
    const { streamId, streamType, extension } = route.params;
    const [streamUrl, setStreamUrl] = React.useState<string | null>(null);

    useEffect(() => {
        prepareStream();
        // In a real app, you'd handle orientation change here (e.g., using react-native-orientation-locker)
        StatusBar.setHidden(true);
        return () => {
            StatusBar.setHidden(false);
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
        console.log('Stream URL:', url);
        setStreamUrl(url);
    };

    if (!streamUrl) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <VLCPlayer
                source={{ uri: streamUrl }}
                style={styles.fullScreen}
                autoplay={true}
                videoAspectRatio="16:9"
                onError={(e: any) => console.error('VLC Error:', e)}
                onEnd={() => navigation.goBack()}
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// Ready to play

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default PlayerScreen;

import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
} from 'react-native';
import Video from 'react-native-video';
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
            url = `${creds.url}/${creds.username}/${creds.password}/${streamId}.ts`;
        } else if (streamType === 'movie') {
            url = `${creds.url}/movie/${creds.username}/${creds.password}/${streamId}.${extension || 'mp4'}`;
        } else if (streamType === 'series') {
            url = `${creds.url}/series/${creds.username}/${creds.password}/${streamId}.${extension || 'mp4'}`;
        }
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
            <Video
                source={{ uri: streamUrl }}
                style={styles.fullScreen}
                controls={true}
                resizeMode="contain"
                onError={(e) => console.error('Video Error:', e)}
                onEnd={() => navigation.goBack()}
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// Simple ActivityIndicator fallback since I didn't import it
const ActivityIndicator = ({ size, color }: any) => (
    <Text style={{ color, fontSize: 18 }}>Loading Stream...</Text>
);

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

import { Linking, Alert, Platform } from 'react-native';
import { xtreamService } from '../services/xtreamService';

export type VideoPlayer = 'infuse' | 'vlc';

export const playInSpecificPlayer = async (
    url: string,
    player: VideoPlayer
) => {
    const isLocal = url.startsWith('/');
    const fileUrl = isLocal ? `file://${url}` : url;

    if (player === 'infuse') {
        const infuseUrl = `infuse://x-callback-url/play?url=${encodeURIComponent(fileUrl)}`;
        const canOpen = await Linking.canOpenURL('infuse://');
        if (canOpen) {
            await Linking.openURL(infuseUrl);
            return true;
        }
    } else {
        const vlcUrl = isLocal ? `vlc://${fileUrl}` : `vlc://${url}`;
        const canOpen = await Linking.canOpenURL('vlc://');
        if (canOpen) {
            await Linking.openURL(vlcUrl);
            return true;
        }
    }
    return false;
};

export const showPlayerPicker = async (
    streamId: number | string,
    streamType: 'live' | 'movie' | 'series',
    extension: string = 'mp4',
    localPath?: string
) => {
    let url = localPath;
    if (!url) {
        url = await xtreamService.buildStreamUrl(streamId, streamType, extension) || '';
    }

    if (!url) {
        Alert.alert('Error', 'Could not build stream URL.');
        return;
    }

    const options = ['Infuse', 'VLC', 'Cancel'];
    const vlcIndex = 1;
    const infuseIndex = 0;
    const cancelIndex = 2;

    Alert.alert(
        'Select Player',
        'Choose a player to start playback',
        [
            {
                text: 'Infuse',
                onPress: async () => {
                    const success = await playInSpecificPlayer(url!, 'infuse');
                    if (!success) promptInstall('infuse');
                }
            },
            {
                text: 'VLC',
                onPress: async () => {
                    const success = await playInSpecificPlayer(url!, 'vlc');
                    if (!success) promptInstall('vlc');
                }
            },
            { text: 'Cancel', style: 'cancel' }
        ]
    );
};

const promptInstall = (player: VideoPlayer) => {
    const name = player === 'infuse' ? 'Infuse' : 'VLC';
    const storeUrl = player === 'infuse'
        ? (Platform.OS === 'ios' ? 'https://apps.apple.com/app/infuse-7/id1136220934' : '')
        : (Platform.OS === 'ios' ? 'https://apps.apple.com/app/vlc-for-mobile/id650377962' : 'https://play.google.com/store/apps/details?id=org.videolan.vlc');

    if (!storeUrl) {
        Alert.alert('Not Installed', `${name} is not installed on your device.`);
        return;
    }

    Alert.alert(
        'Player Not Found',
        `${name} is required for this selection. Would you like to install it?`,
        [
            { text: 'No', style: 'cancel' },
            { text: 'Install', onPress: () => Linking.openURL(storeUrl) }
        ]
    );
};

export const playInExternalPlayer = async (
    streamId: number | string,
    streamType: 'live' | 'movie' | 'series',
    extension: string = 'mp4'
) => {
    // Standard fallback logic remains for direct calls
    try {
        const streamUrl = await xtreamService.buildStreamUrl(streamId, streamType, extension);
        if (!streamUrl) {
            Alert.alert('Error', 'Could not build stream URL.');
            return;
        }

        const success = await playInSpecificPlayer(streamUrl, 'infuse');
        if (!success) {
            const vlcSuccess = await playInSpecificPlayer(streamUrl, 'vlc');
            if (!vlcSuccess) {
                promptInstall('infuse'); // Fallback to prompt for preferred player
            }
        }
    } catch (error) {
        console.error('Playback error:', error);
    }
};

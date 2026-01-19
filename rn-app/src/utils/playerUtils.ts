import { Linking, Alert, Platform } from 'react-native';
import { xtreamService } from '../services/xtreamService';

export const playInExternalPlayer = async (
    streamId: number | string,
    streamType: 'live' | 'movie' | 'series',
    extension: string = 'mp4'
) => {
    try {
        const streamUrl = await xtreamService.buildStreamUrl(streamId, streamType, extension);
        if (!streamUrl) {
            Alert.alert('Error', 'Could not build stream URL.');
            return;
        }

        // VLC deep link scheme
        const vlcUrl = `vlc://${streamUrl}`;

        const canOpen = await Linking.canOpenURL('vlc://');

        if (canOpen) {
            await Linking.openURL(vlcUrl);
        } else {
            // If vlc:// is not supported or not installed, try opening the raw URL
            // which might trigger a choice of players on Android or open browser on iOS
            Alert.alert(
                'VLC not found',
                'VLC Media Player is required for playback. Would you like to try opening it anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: Platform.OS === 'ios' ? 'Get VLC' : 'Open anyway',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('https://apps.apple.com/app/vlc-for-mobile/id650377962');
                            } else {
                                Linking.openURL(streamUrl);
                            }
                        }
                    }
                ]
            );
        }
    } catch (error) {
        console.error('Playback error:', error);
        Alert.alert('Error', 'An unexpected error occurred while trying to play the stream.');
    }
};

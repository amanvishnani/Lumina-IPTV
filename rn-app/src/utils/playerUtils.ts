import { Linking, Alert, Platform } from 'react-native';
import { xtreamService } from '../services/xtreamService';

export const playInExternalPlayer = async (
    streamId: number | string,
    streamType: 'live' | 'movie' | 'series',
    extension: string = 'mp4'
) => {
    try {
        const streamUrl = await xtreamService.buildStreamUrl(streamId, streamType, extension);
        console.log(streamUrl);
        if (!streamUrl) {
            Alert.alert('Error', 'Could not build stream URL.');
            return;
        }

        // Try Infuse first (preferred player)
        const infuseUrl = `infuse://x-callback-url/play?url=${encodeURIComponent(streamUrl)}`;
        const canOpenInfuse = await Linking.canOpenURL('infuse://');

        if (canOpenInfuse) {
            await Linking.openURL(infuseUrl);
            return;
        }

        // Fallback to VLC if Infuse is not available
        const vlcUrl = `vlc://${streamUrl}`;
        const canOpenVLC = await Linking.canOpenURL('vlc://');

        if (canOpenVLC) {
            await Linking.openURL(vlcUrl);
            return;
        }

        // Neither player is installed
        Alert.alert(
            'No Player Found',
            'Infuse or VLC Media Player is required for playback. Which would you like to install?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Get Infuse',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('https://apps.apple.com/app/infuse-7/id1136220934');
                        }
                    }
                },
                {
                    text: 'Get VLC',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('https://apps.apple.com/app/vlc-for-mobile/id650377962');
                        } else {
                            Linking.openURL('https://play.google.com/store/apps/details?id=org.videolan.vlc');
                        }
                    }
                }
            ]
        );
    } catch (error) {
        console.error('Playback error:', error);
        Alert.alert('Error', 'An unexpected error occurred while trying to play the stream.');
    }
};

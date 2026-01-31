import { DEFAULT_URL, DEFAULT_USERNAME, DEFAULT_PASSWORD } from '@env';

export const CONFIG = {
    features: {
        enableDownloads: false, // Set to true to enable the download feature
    },
    defaults: {
        url: DEFAULT_URL || '',
        username: DEFAULT_USERNAME || '',
        password: DEFAULT_PASSWORD || '',
    },
};

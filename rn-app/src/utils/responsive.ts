import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get initial dimensions
let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Update dimensions on change (handles orientation changes)
Dimensions.addEventListener('change', ({ window }) => {
    SCREEN_WIDTH = window.width;
    SCREEN_HEIGHT = window.height;
});

// Device type detection
export const isTablet = () => {
    const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
    const pixelDensity = PixelRatio.get();

    // iPad detection: larger screen + lower pixel density
    return (
        Platform.OS === 'ios' &&
        (SCREEN_WIDTH >= 768 || SCREEN_HEIGHT >= 768) &&
        pixelDensity < 2.5
    );
};

export const isIPad = isTablet;


// Get current dimensions
export const getScreenDimensions = () => ({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
});

// Responsive scaling based on device
const baseWidth = 375; // iPhone standard width
const baseHeight = 812; // iPhone standard height

export const scaleWidth = (size: number): number => {
    const scale = SCREEN_WIDTH / baseWidth;
    return Math.round(size * scale);
};

export const scaleHeight = (size: number): number => {
    const scale = SCREEN_HEIGHT / baseHeight;
    return Math.round(size * scale);
};

// Moderate scale - scales less aggressively for better iPad experience
export const moderateScale = (size: number, factor: number = 0.5): number => {
    const scale = SCREEN_WIDTH / baseWidth;
    return Math.round(size + (scale - 1) * size * factor);
};

// Font scaling
export const scaleFontSize = (size: number): number => {
    const scale = SCREEN_WIDTH / baseWidth;
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive font size with max cap for tablets
export const responsiveFontSize = (size: number): number => {
    if (isTablet()) {
        // Cap font size growth on tablets
        const scale = Math.min(SCREEN_WIDTH / baseWidth, 1.5);
        return Math.round(size * scale);
    }
    return scaleFontSize(size);
};

// Spacing utilities
export const spacing = {
    xxs: moderateScale(2),
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(16),
    lg: moderateScale(24),
    xl: moderateScale(32),
    xxl: moderateScale(48),
};

// Breakpoints
export const breakpoints = {
    phone: 0,
    tablet: 768,
    desktop: 1024,
};

export const getDeviceType = (): 'phone' | 'tablet' => {
    return SCREEN_WIDTH >= breakpoints.tablet ? 'tablet' : 'phone';
};

// Grid columns based on device
export const getGridColumns = (): number => {
    const deviceType = getDeviceType();
    return deviceType === 'tablet' ? 3 : 1;
};

// Responsive value selector
export const responsiveValue = <T,>(phoneValue: T, tabletValue: T): T => {
    return getDeviceType() === 'tablet' ? tabletValue : phoneValue;
};

// Orientation detection
export const isLandscape = (): boolean => {
    return SCREEN_WIDTH > SCREEN_HEIGHT;
};

export const isPortrait = (): boolean => {
    return SCREEN_HEIGHT > SCREEN_WIDTH;
};

// Safe area helpers
export const getSafeAreaPadding = () => {
    if (isTablet()) {
        return {
            horizontal: spacing.xl,
            vertical: spacing.lg,
        };
    }
    return {
        horizontal: spacing.md,
        vertical: spacing.md,
    };
};

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import VodListScreen from '../screens/VodListScreen';
import SeriesListScreen from '../screens/SeriesListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { responsiveFontSize, moderateScale, spacing } from '../utils/responsive';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
    const getIcon = () => {
        switch (label) {
            case 'Live TV':
                return '📺';
            case 'Movies':
                return '🎬';
            case 'Series':
                return '📺';
            case 'Settings':
                return '⚙️';
            default:
                return '•';
        }
    };

    return (
        <Text style={[styles.icon, focused && styles.iconFocused]}>
            {getIcon()}
        </Text>
    );
};

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: styles.tabItem,
            }}
        >
            <Tab.Screen
                name="LiveTV"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Live TV',
                    tabBarIcon: ({ focused }) => <TabIcon label="Live TV" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Movies"
                component={VodListScreen}
                options={{
                    tabBarLabel: 'Movies',
                    tabBarIcon: ({ focused }) => <TabIcon label="Movies" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Series"
                component={SeriesListScreen}
                options={{
                    tabBarLabel: 'Series',
                    tabBarIcon: ({ focused }) => <TabIcon label="Series" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ focused }) => <TabIcon label="Settings" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#1C1C1E',
        borderTopColor: '#38383A',
        borderTopWidth: 1,
        height: moderateScale(60),
        paddingBottom: spacing.xs,
        paddingTop: spacing.xs,
    },
    tabLabel: {
        fontSize: responsiveFontSize(10),
        fontWeight: '600',
        marginTop: -spacing.xs,
    },
    tabItem: {
        paddingVertical: spacing.xs,
    },
    icon: {
        fontSize: responsiveFontSize(10),
        opacity: 0.6,
    },
    iconFocused: {
        opacity: 1,
    },
});

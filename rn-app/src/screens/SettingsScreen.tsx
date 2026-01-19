import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { xtreamService } from '../services/xtreamService';
import { cacheService } from '../services/cacheService';
import { responsiveFontSize, spacing, moderateScale } from '../utils/responsive';

const SettingsScreen = ({ navigation }: any) => {
    const [clearing, setClearing] = useState(false);

    const handleClearCache = async () => {
        setClearing(true);
        try {
            await cacheService.clearAll();
            Alert.alert('Success', 'Cache cleared successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to clear cache.');
        } finally {
            setClearing(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await xtreamService.logout();
                        await cacheService.clearAll();
                        navigation.replace('Login');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleClearCache}
                        disabled={clearing}
                    >
                        <View>
                            <Text style={styles.settingLabel}>Clear Cache</Text>
                            <Text style={styles.settingSubLabel}>Delete all cached categories and stream lists (10min cache)</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                        <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        fontSize: responsiveFontSize(20),
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: spacing.md,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        color: '#666',
        fontSize: responsiveFontSize(13),
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    settingItem: {
        backgroundColor: '#1a1a1a',
        padding: spacing.md,
        borderRadius: moderateScale(10),
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#333',
    },
    settingLabel: {
        color: '#fff',
        fontSize: responsiveFontSize(16),
        fontWeight: '500',
    },
    settingSubLabel: {
        color: '#888',
        fontSize: responsiveFontSize(12),
        marginTop: spacing.xs,
    },
    footer: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    versionText: {
        color: '#444',
        fontSize: responsiveFontSize(14),
    },
});

export default SettingsScreen;

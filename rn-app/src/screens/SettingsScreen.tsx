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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 60 }} />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        width: 60,
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: '#666',
        fontSize: 13,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginLeft: 5,
    },
    settingItem: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    settingLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubLabel: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    versionText: {
        color: '#444',
        fontSize: 14,
    },
});

export default SettingsScreen;

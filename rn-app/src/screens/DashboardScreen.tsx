import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
    SafeAreaView,
} from 'react-native';
import { xtreamService } from '../services/xtreamService';
import { XtreamCategory, XtreamStream } from '../types';

const DashboardScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<XtreamCategory[]>([]);
    const [streams, setStreams] = useState<XtreamStream[]>([]);
    const [filteredStreams, setFilteredStreams] = useState<XtreamStream[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const cats = await xtreamService.getLiveCategories();
            setCategories(cats);
            await fetchStreams('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStreams = async (categoryId: string) => {
        setLoading(true);
        try {
            const data = await xtreamService.getLiveStreams(categoryId);
            setStreams(data);
            setFilteredStreams(data);
            setPage(1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (id: string) => {
        setSelectedCategoryId(id);
        setSearchTerm('');
        fetchStreams(id);
    };

    const handleSearch = (text: string) => {
        setSearchTerm(text);
        const filtered = streams.filter((s) =>
            s.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredStreams(filtered);
        setPage(1);
    };

    const renderStreamItem = ({ item }: { item: XtreamStream }) => (
        <TouchableOpacity
            style={styles.streamItem}
            onPress={() => navigation.navigate('Player', {
                streamId: item.stream_id,
                streamType: 'live'
            })}
        >
            <Image
                source={{ uri: item.stream_icon || 'https://via.placeholder.com/50' }}
                style={styles.streamIcon}
            />
            <View style={styles.streamInfo}>
                <Text style={styles.streamName} numberOfLines={1}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    const paginatedData = filteredStreams.slice(0, page * pageSize);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live TV</Text>
                <TouchableOpacity onPress={() => {
                    xtreamService.logout();
                    navigation.replace('Login');
                }}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.controls}>
                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search channels..."
                        placeholderTextColor="#888"
                        value={searchTerm}
                        onChangeText={handleSearch}
                    />
                </View>

                <FlatList
                    horizontal
                    data={[{ category_id: '', category_name: 'All' }, ...categories]}
                    keyExtractor={(item) => item.category_id}
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryItem,
                                selectedCategoryId === item.category_id && styles.categoryItemActive,
                            ]}
                            onPress={() => handleCategoryChange(item.category_id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategoryId === item.category_id && styles.categoryTextActive,
                            ]}>
                                {item.category_name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.navButtons}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Movies')}>
                    <Text style={styles.navButtonText}>Movies</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Series')}>
                    <Text style={styles.navButtonText}>Series</Text>
                </TouchableOpacity>
            </View>

            {loading && page === 1 ? (
                <View style={styles.centerLoader}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={paginatedData}
                    keyExtractor={(item) => item.stream_id.toString()}
                    renderItem={renderStreamItem}
                    onEndReached={() => {
                        if (paginatedData.length < filteredStreams.length) {
                            setPage(page + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.noData}>No channels found</Text>
                    }
                />
            )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
    },
    controls: {
        paddingHorizontal: 15,
    },
    searchBar: {
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        marginBottom: 15,
    },
    searchInput: {
        padding: 12,
        color: '#fff',
        fontSize: 16,
    },
    categoryList: {
        marginBottom: 15,
    },
    categoryItem: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    categoryItemActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        color: '#ccc',
        fontSize: 14,
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    navButtons: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 15,
        gap: 10,
    },
    navButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    navButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    streamItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    streamIcon: {
        width: 50,
        height: 50,
        borderRadius: 5,
        backgroundColor: '#333',
    },
    streamInfo: {
        marginLeft: 15,
        flex: 1,
    },
    streamName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    centerLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noData: {
        color: '#888',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});

export default DashboardScreen;

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
import {
    getGridColumns,
    responsiveFontSize,
    spacing,
    moderateScale,
    responsiveValue
} from '../utils/responsive';

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

    const numColumns = getGridColumns();

    const paginatedData = filteredStreams.slice(0, page * pageSize);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live TV</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.settingsText}>Settings</Text>
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

            {loading && page === 1 ? (
                <View style={styles.centerLoader}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    key={numColumns}
                    data={paginatedData}
                    keyExtractor={(item) => item.stream_id.toString()}
                    renderItem={renderStreamItem}
                    numColumns={numColumns}
                    onEndReached={() => {
                        if (paginatedData.length < filteredStreams.length) {
                            setPage(page + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
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
        padding: spacing.md,
    },
    headerTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(24),
        fontWeight: 'bold',
    },
    settingsText: {
        color: '#007AFF',
        fontSize: responsiveFontSize(16),
    },
    controls: {
        paddingHorizontal: spacing.md,
    },
    searchBar: {
        backgroundColor: '#1a1a1a',
        borderRadius: moderateScale(10),
        marginBottom: spacing.md,
    },
    searchInput: {
        padding: spacing.sm + 4,
        color: '#fff',
        fontSize: responsiveFontSize(16),
    },
    categoryList: {
        marginBottom: spacing.md,
    },
    categoryItem: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: moderateScale(20),
        backgroundColor: '#1a1a1a',
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: '#333',
    },
    categoryItemActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        color: '#ccc',
        fontSize: responsiveFontSize(14),
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    streamItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: spacing.sm + 4,
        borderRadius: moderateScale(10),
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#333',
        flex: responsiveValue(1, 0.32),
    },
    streamIcon: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(5),
        backgroundColor: '#333',
    },
    streamInfo: {
        marginLeft: spacing.md,
        flex: 1,
    },
    streamName: {
        color: '#fff',
        fontSize: responsiveFontSize(16),
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
        marginTop: moderateScale(50),
        fontSize: responsiveFontSize(16),
    },
});

export default DashboardScreen;

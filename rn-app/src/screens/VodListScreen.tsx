import React, { useEffect, useState } from 'react';
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
    getScreenDimensions
} from '../utils/responsive';

const getItemWidth = () => {
    const { width } = getScreenDimensions();
    const columnCount = getGridColumns();
    const totalSpacing = spacing.md * 2 + (spacing.sm * 2 * columnCount);
    return (width - totalSpacing) / columnCount;
};

const VodListScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<XtreamCategory[]>([]);
    const [streams, setStreams] = useState<XtreamStream[]>([]);
    const [filteredStreams, setFilteredStreams] = useState<XtreamStream[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 18;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const cats = await xtreamService.getVodCategories();
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
            const data = await xtreamService.getVodStreams(categoryId);
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

    const renderVodItem = ({ item }: { item: XtreamStream }) => {
        const itemWidth = getItemWidth();
        return (
            <TouchableOpacity
                style={[styles.vodCard, { width: itemWidth }]}
                onPress={() => navigation.navigate('VodDetails', { streamId: item.stream_id })}
            >
                <Image
                    source={{ uri: item.stream_icon || 'https://via.placeholder.com/150x225' }}
                    style={[styles.poster, { height: itemWidth * 1.5 }]}
                    resizeMode="cover"
                />
                <Text style={styles.vodName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const numColumns = getGridColumns();

    const paginatedData = filteredStreams.slice(0, page * pageSize);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Movies</Text>
            </View>

            <View style={styles.controls}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search movies..."
                    placeholderTextColor="#888"
                    value={searchTerm}
                    onChangeText={handleSearch}
                />

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
                    renderItem={renderVodItem}
                    numColumns={numColumns}
                    onEndReached={() => {
                        if (paginatedData.length < filteredStreams.length) {
                            setPage(page + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.noData}>No movies found</Text>
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
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        color: '#fff',
        fontSize: responsiveFontSize(20),
        fontWeight: 'bold',
    },
    controls: {
        paddingHorizontal: spacing.md,
    },
    searchInput: {
        backgroundColor: '#1a1a1a',
        borderRadius: moderateScale(8),
        padding: spacing.sm + 4,
        color: '#fff',
        fontSize: responsiveFontSize(16),
        marginBottom: spacing.md,
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
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.md,
    },
    vodCard: {
        marginHorizontal: spacing.xs,
        marginBottom: spacing.md,
    },
    poster: {
        width: '100%',
        borderRadius: moderateScale(8),
        backgroundColor: '#1a1a1a',
    },
    vodName: {
        color: '#fff',
        fontSize: responsiveFontSize(12),
        marginTop: spacing.sm,
        textAlign: 'center',
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

export default VodListScreen;

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
import { XtreamCategory, XtreamSeries } from '../types';
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

const SeriesListScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<XtreamCategory[]>([]);
    const [series, setSeries] = useState<XtreamSeries[]>([]);
    const [filteredSeries, setFilteredSeries] = useState<XtreamSeries[]>([]);
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
            const cats = await xtreamService.getSeriesCategories();
            setCategories(cats);
            await fetchSeries('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSeries = async (categoryId: string) => {
        setLoading(true);
        try {
            const data = await xtreamService.getSeries(categoryId);
            setSeries(data);
            setFilteredSeries(data);
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
        fetchSeries(id);
    };

    const handleSearch = (text: string) => {
        setSearchTerm(text);
        const filtered = series.filter((s) =>
            s.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredSeries(filtered);
        setPage(1);
    };

    const renderSeriesItem = ({ item }: { item: XtreamSeries }) => {
        const itemWidth = getItemWidth();
        return (
            <TouchableOpacity
                style={[styles.seriesCard, { width: itemWidth }]}
                onPress={() => navigation.navigate('SeriesDetails', { seriesId: item.series_id })}
            >
                <Image
                    source={{ uri: item.cover || 'https://via.placeholder.com/150x225' }}
                    style={[styles.poster, { height: itemWidth * 1.5 }]}
                    resizeMode="cover"
                />
                <Text style={styles.seriesName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const numColumns = getGridColumns();

    const paginatedData = filteredSeries.slice(0, page * pageSize);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>TV Shows</Text>
            </View>

            <View style={styles.controls}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search series..."
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
                    keyExtractor={(item) => item.series_id.toString()}
                    renderItem={renderSeriesItem}
                    numColumns={numColumns}
                    onEndReached={() => {
                        if (paginatedData.length < filteredSeries.length) {
                            setPage(page + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.noData}>No series found</Text>
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
    seriesCard: {
        marginHorizontal: spacing.xs,
        marginBottom: spacing.md,
    },
    poster: {
        width: '100%',
        borderRadius: moderateScale(8),
        backgroundColor: '#1a1a1a',
    },
    seriesName: {
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

export default SeriesListScreen;

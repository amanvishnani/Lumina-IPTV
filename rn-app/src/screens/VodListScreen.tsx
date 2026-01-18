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
    Dimensions,
} from 'react-native';
import { xtreamService } from '../services/xtreamService';
import { XtreamCategory, XtreamStream } from '../types';

const { width } = Dimensions.get('window');
const columnCount = 3;
const itemWidth = (width - 40) / columnCount;

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

    const renderVodItem = ({ item }: { item: XtreamStream }) => (
        <TouchableOpacity
            style={styles.vodCard}
            onPress={() => navigation.navigate('VodDetails', { streamId: item.stream_id })}
        >
            <Image
                source={{ uri: item.stream_icon || 'https://via.placeholder.com/150x225' }}
                style={styles.poster}
                resizeMode="cover"
            />
            <Text style={styles.vodName} numberOfLines={2}>{item.name}</Text>
        </TouchableOpacity>
    );

    const paginatedData = filteredStreams.slice(0, page * pageSize);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Movies (VOD)</Text>
                <View style={{ width: 40 }} />
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
                    data={paginatedData}
                    keyExtractor={(item) => item.stream_id.toString()}
                    renderItem={renderVodItem}
                    numColumns={columnCount}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    backText: {
        color: '#007AFF',
        fontSize: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    controls: {
        paddingHorizontal: 15,
    },
    searchInput: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        marginBottom: 15,
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
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    vodCard: {
        width: itemWidth,
        marginHorizontal: 5,
        marginBottom: 20,
    },
    poster: {
        width: '100%',
        height: itemWidth * 1.5,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
    },
    vodName: {
        color: '#fff',
        fontSize: 12,
        marginTop: 8,
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
        marginTop: 50,
        fontSize: 16,
    },
});

export default VodListScreen;

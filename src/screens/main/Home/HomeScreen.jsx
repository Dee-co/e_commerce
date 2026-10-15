import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUpDown, Check, Search, X } from 'lucide-react-native';

import AppButton from '../../../components/ui/AppButton';
import AppText from '../../../components/ui/AppText';
import { useTheme } from '../../../context/ThemeContext';
import { normalizeProduct } from '../../../utils/normalizeProduct';
import {
  getCategories,
  getProducts,
  getProductsByCategory,
  searchProducts,
} from '../../../services/productService';
import CategorySection from './components/CategorySection';
import ProductSection from './components/ProductSection';
import { useNavigation } from '@react-navigation/native';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', api: null },
  {
    id: 'price-asc',
    label: 'Price: Low to High',
    api: { sortBy: 'price', order: 'asc' },
  },
  {
    id: 'price-desc',
    label: 'Price: High to Low',
    api: { sortBy: 'price', order: 'desc' },
  },
  {
    id: 'rating',
    label: 'Rating: High to Low',
    api: { sortBy: 'rating', order: 'desc' },
  },
  {
    id: 'name',
    label: 'Name: A to Z',
    api: { sortBy: 'title', order: 'asc' },
  },
];

// ---------- helpers ----------

const slugToTitle = slug =>
  String(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

// dummyjson categories kabhi string hoti hain, kabhi { slug, name } object
const toCategory = item =>
  typeof item === 'string'
    ? { id: item, name: slugToTitle(item) }
    : { id: item.slug, name: item.name ?? slugToTitle(item.slug) };

const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

// ---------- search + sort button ----------

// Typing ka state yahin rakha hai, taaki har keystroke par poori HomeScreen re-render na ho
const SearchRow = memo(({ value, onSearch, sortActive, onOpenSort }) => {
  const { colors } = useTheme();
  const [text, setText] = useState(value);
  const debouncedText = useDebouncedValue(text, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    onSearch(debouncedText.trim());
  }, [debouncedText, onSearch]);

  // Category select hone par parent query '' kar deta hai, to input bhi khaali ho
  useEffect(() => {
    if (value === '') {
      setText('');
    }
  }, [value]);

  return (
    <View className="flex-row items-center px-5">
      <View className="h-11 flex-1 flex-row items-center rounded-xl border border-border bg-surface px-3">
        <Search size={18} color={colors.textMuted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Search products"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          className="ml-2 flex-1 text-[15px] text-textPrimary"
          style={{ includeFontPadding: false, paddingVertical: 0 }}
        />
        {text.length > 0 && (
          <Pressable
            onPress={() => setText('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={onOpenSort}
        accessibilityRole="button"
        accessibilityLabel="Sort products"
        className="ml-3 h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface"
      >
        <ArrowUpDown
          size={18}
          color={sortActive ? colors.primary : colors.textPrimary}
        />
        {sortActive && (
          <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        )}
      </Pressable>
    </View>
  );
});

// ---------- sticky block: search + sort + categories ----------

const StickyControls = memo(
  ({
    query,
    onSearch,
    categories,
    selectedCategory,
    onSelectCategory,
    sortActive,
    onOpenSort,
  }) => (
    // bg-background zaroori hai, warna neeche ke products peeche se dikhenge
    <View className="border-b border-border bg-background pb-3 pt-2">
      <SearchRow
        value={query}
        onSearch={onSearch}
        sortActive={sortActive}
        onOpenSort={onOpenSort}
      />
      <View className="mt-3">
        <CategorySection
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </View>
    </View>
  ),
);

// ---------- sort bottom sheet ----------

const SortSheet = ({ visible, selectedId, onSelect, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        {/* Andar ka empty onPress, taaki sheet par tap karne se backdrop close na ho */}
        <Pressable
          className="rounded-t-3xl bg-surface px-5 pb-8 pt-4"
          onPress={() => {}}
        >
          <AppText variant="title" className="mb-2 text-lg">
            Sort by
          </AppText>

          {SORT_OPTIONS.map(option => {
            const selected = option.id === selectedId;

            return (
              <Pressable
                key={option.id}
                onPress={() => onSelect(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="h-12 flex-row items-center justify-between border-b border-border"
              >
                <AppText
                  variant={selected ? 'button' : 'bodySmall'}
                  color={selected ? colors.primary : colors.textPrimary}
                >
                  {option.label}
                </AppText>
                {selected && <Check size={18} color={colors.primary} />}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ---------- product row (2 cards) ----------

// memo + primitive props (qty numbers), taaki cart change par sirf wahi row re-render ho
const ProductRow = memo(
  ({
    left,
    right,
    leftQty,
    rightQty,
    onPress,
    onAddToCart,
    onIncrement,
    onDecrement,
  }) => (
    <View className="flex-row px-3.5">
      <ProductSection
        product={left}
        quantity={leftQty}
        onPress={onPress}
        onAddToCart={onAddToCart}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />
      {right ? (
        <ProductSection
          product={right}
          quantity={rightQty}
          onPress={onPress}
          onAddToCart={onAddToCart}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      ) : (
        // odd number of products: khaali jagah, card jaisi hi margin
        <View className="mx-1.5 flex-1" />
      )}
    </View>
  ),
);

const Greeting = memo(() => {
  const { colors } = useTheme();

  return (
    <View className="px-5 pb-3 pt-4">
      <AppText variant="title" className="text-2xl">
        Discover
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        Find the best products for you
      </AppText>
    </View>
  );
});

// ---------- screen ----------

const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation()
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortId, setSortId] = useState('relevance');
  const [sortVisible, setSortVisible] = useState(false);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading'); // 'loading' | 'idle' | 'error'
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Local cart. Aapka cart context ho to ye state hata kar wahan se lo
  const [cart, setCart] = useState({});

  // Filter badalne par purani request ka result ignore karne ke liye
  const generation = useRef(0);
  const loadMoreLock = useRef(false);

  const sort = useMemo(
    () => SORT_OPTIONS.find(option => option.id === sortId)?.api ?? null,
    [sortId],
  );

  // dummyjson mein search aur category ek saath nahi chalte.
  // Isliye: search karo to category 'All' ho jati hai, aur category chuno to search clear.
  const fetchPage = useCallback(
    (skip, signal) => {
      const options = { limit: PAGE_SIZE, skip, sort, signal };

      if (query) {
        return searchProducts(query, options);
      }
      if (selectedCategory) {
        return getProductsByCategory(selectedCategory, options);
      }
      return getProducts(options);
    },
    [query, selectedCategory, sort],
  );

  const loadFirstPage = useCallback(
    async signal => {
      const current = ++generation.current;
      loadMoreLock.current = false;
      setLoadingMore(false);

      try {
        const data = await fetchPage(0, signal);
        if (current !== generation.current) {
          return;
        }
        setProducts(data.products.map(normalizeProduct));
        setTotal(data.total);
        setStatus('idle');
      } catch (error) {
        if (error?.name === 'AbortError' || current !== generation.current) {
          return;
        }
        console.log('LOAD FIRST PAGE ERROR:', error);
        setStatus('error');
      }
    },
    [fetchPage],
  );

  // Query, category ya sort badle to list dobara shuru se
  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setProducts([]);
    setTotal(0);
    loadFirstPage(controller.signal);

    return () => controller.abort();
  }, [loadFirstPage]);

  // Categories sirf ek baar
  useEffect(() => {
    const controller = new AbortController();

    getCategories(controller.signal)
      .then(data => setCategories((data ?? []).map(toCategory)))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const loadMore = useCallback(async () => {
    if (
      status !== 'idle' ||
      loadMoreLock.current ||
      products.length === 0 ||
      products.length >= total
    ) {
      return;
    }

    const current = generation.current;
    loadMoreLock.current = true;
    setLoadingMore(true);

    try {
      const data = await fetchPage(products.length);
      if (current !== generation.current) {
        return;
      }
      const next = data.products.map(normalizeProduct);
      setProducts(prev => {
        const seen = new Set(prev.map(item => item.id));
        return [...prev, ...next.filter(item => !seen.has(item.id))];
      });
      setTotal(data.total);
    } catch {
      // Silently ignore. User phir scroll karega to dobara try hoga
    } finally {
      if (current === generation.current) {
        loadMoreLock.current = false;
        setLoadingMore(false);
      }
    }
  }, [status, products.length, total, fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  }, [loadFirstPage]);

  const retry = useCallback(() => {
    setStatus('loading');
    loadFirstPage();
  }, [loadFirstPage]);

  // ----- handlers (stable, taaki memo components re-render na hon) -----

  const handleSearch = useCallback(text => {
    setQuery(text);
    if (text) {
      setSelectedCategory(null);
    }
  }, []);

  const handleSelectCategory = useCallback(categoryId => {
    setSelectedCategory(categoryId);
    setQuery('');
  }, []);

  const handleOpenSort = useCallback(() => setSortVisible(true), []);
  const handleCloseSort = useCallback(() => setSortVisible(false), []);
  const handleSelectSort = useCallback(id => {
    setSortId(id);
    setSortVisible(false);
  }, []);

  const handleProductPress = useCallback(
  product => {
    navigation.navigate('ProductDetails', {
      productId: product.id,
      product,
    });
  },
  [navigation],
);

  const handleAddToCart = useCallback(product => {
    setCart(prev => ({ ...prev, [product.id]: 1 }));
  }, []);

  const handleIncrement = useCallback(product => {
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
  }, []);

  const handleDecrement = useCallback(product => {
    setCart(prev => {
      const nextQty = (prev[product.id] ?? 0) - 1;
      if (nextQty <= 0) {
        const { [product.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product.id]: nextQty };
    });
  }, []);

  // ----- list data -----
  // Pehla item hamesha 'controls' hai (sticky). Uske baad 2-2 products ki rows.
  const listData = useMemo(() => {
    const items = [{ type: 'controls', key: 'controls' }];

    if (products.length === 0) {
      items.push({
        type: status === 'idle' ? 'empty' : status,
        key: 'status',
      });
      return items;
    }

    for (let i = 0; i < products.length; i += 2) {
      items.push({
        type: 'row',
        key: `row-${products[i].id}`,
        left: products[i],
        right: products[i + 1] ?? null,
      });
    }
    return items;
  }, [products, status]);

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case 'controls':
          return (
            <StickyControls
              query={query}
              onSearch={handleSearch}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              sortActive={sortId !== 'relevance'}
              onOpenSort={handleOpenSort}
            />
          );

        case 'row':
          return (
            <ProductRow
              left={item.left}
              right={item.right}
              leftQty={cart[item.left.id] ?? 0}
              rightQty={item.right ? (cart[item.right.id] ?? 0) : 0}
              onPress={handleProductPress}
              onAddToCart={handleAddToCart}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          );

        case 'loading':
          return (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          );

        case 'error':
          return (
            <View className="items-center px-8 py-16">
              <AppText variant="title" className="text-center text-base">
                Something went wrong
              </AppText>
              <AppText
                variant="caption"
                color={colors.textSecondary}
                className="mb-4 mt-1 text-center"
              >
                Could not load products. Check your internet and try again.
              </AppText>
              <AppButton title="Retry" size="sm" onPress={retry} />
            </View>
          );

        case 'empty':
          return (
            <View className="items-center px-8 py-16">
              <AppText variant="title" className="text-center text-base">
                No products found
              </AppText>
              <AppText
                variant="caption"
                color={colors.textSecondary}
                className="mt-1 text-center"
              >
                Try a different search or category.
              </AppText>
            </View>
          );

        default:
          return null;
      }
    },
    [
      query,
      categories,
      selectedCategory,
      sortId,
      cart,
      colors,
      retry,
      handleSearch,
      handleSelectCategory,
      handleOpenSort,
      handleProductPress,
      handleAddToCart,
      handleIncrement,
      handleDecrement,
    ],
  );

  const listFooter = loadingMore ? (
    <View className="items-center py-4">
      <ActivityIndicator color={colors.primary} />
    </View>
  ) : status === 'idle' && products.length > 0 && products.length >= total ? (
    <AppText
      variant="caption"
      color={colors.textMuted}
      className="py-4 text-center"
    >
      You have seen all products
    </AppText>
  ) : null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlatList
        data={listData}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        ListHeaderComponent={Greeting}
        ListFooterComponent={listFooter}
        // ListHeaderComponent index 0 hai, isliye pehla data item (controls) index 1 hai
        stickyHeaderIndices={[1]}
        // Android par default true hota hai aur sticky header gayab kar sakta hai
        removeClippedSubviews={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        windowSize={7}
        contentContainerClassName="pb-6"
      />

      <SortSheet
        visible={sortVisible}
        selectedId={sortId}
        onSelect={handleSelectSort}
        onClose={handleCloseSort}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
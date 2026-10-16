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
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowUpDown,
  Check,
  Moon,
  Search,
  Sun,
  WifiOff,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import AppButton from '../../../components/ui/AppButton';
import AppText from '../../../components/ui/AppText';
import AppList from '../../../components/ui/AppList';
import AppSafeAreaView from '../../../components/ui/AppSafeAreaView';
import { useTheme } from '../../../context/ThemeContext';
import { normalizeProduct } from '../../../utils/normalizeProduct';
import { useNetworkStatus } from '../../../utils/network';
import {
  getCategories,
  getProducts,
  getProductsByCategory,
  isRequestCanceled,
  searchProducts,
} from '../../../services/productService';
import {
  addToCart,
  decrementQuantity,
  incrementQuantity,
} from '../../../store/slices/cartSlice';
import { toggleWishlist } from '../../../store/slices/wishlistSlice';

import CategorySection from './components/CategorySection';
import ProductSection from './components/ProductSection';
import { showTestNotification } from '../../../services/notificationService';

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

// Odd number of products hone par last card poori width na le, isliye khaali cell
const SPACER = { id: 'spacer', isSpacer: true };

const slugToTitle = slug =>
  String(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

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

const SearchRow = memo(({ value, onSearch, sortActive, onOpenSort }) => {
  const { colors } = useTheme();
  const [text, setText] = useState(value);
  const debouncedText = useDebouncedValue(text, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    onSearch(debouncedText.trim());
  }, [debouncedText, onSearch]);

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
    <View className="mb-5 border-b border-border bg-background pb-3 pt-2">
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
        <Pressable
          className="rounded-t-3xl bg-surface px-5 pb-8 pt-4"
          onPress={() => { }}
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

const Greeting = memo(() => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
      <View className="flex-1">
        <AppText variant="title" className="text-2xl">
          Discover
        </AppText>

        <AppText variant="caption" color={colors.textSecondary}>
          Find the best products for you
        </AppText>
      </View>

      <Pressable
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={
          isDark ? 'Switch to light theme' : 'Switch to dark theme'
        }
        className="ml-3 h-11 w-11 items-center justify-center rounded-xl border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        {isDark ? (
          <Sun size={21} color={colors.primary} />
        ) : (
          <Moon size={21} color={colors.primary} />
        )}
      </Pressable>
    </View>
  );
});

const HomeScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isOffline } = useNetworkStatus();

  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);

  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortId, setSortId] = useState('relevance');
  const [sortVisible, setSortVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [greetingHeight, setGreetingHeight] = useState(0);
  const [controlsHeight, setControlsHeight] = useState(0);

  const generation = useRef(0);
  const loadMoreLock = useRef(false);
  const hasProducts = useRef(false);
  const needsRefresh = useRef(false);
  const wasOffline = useRef(false);

  hasProducts.current = products.length > 0;
  const scrollY = useRef(new Animated.Value(0)).current;

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      }),
    [scrollY],
  );

  const controlsTranslateY = useMemo(() => {
    const h = Math.max(greetingHeight, 1);

    return scrollY.interpolate({
      inputRange: [-100, 0, h],
      outputRange: [h + 100, h, 0],
      extrapolateLeft: 'extend',
      extrapolateRight: 'clamp',
    });
  }, [scrollY, greetingHeight]);
  useEffect(() => {
    showTestNotification();
  }, []);
  const handleGreetingLayout = useCallback(event => {
    setGreetingHeight(Math.round(event.nativeEvent.layout.height));
  }, []);

  const handleControlsLayout = useCallback(event => {
    setControlsHeight(Math.round(event.nativeEvent.layout.height));
  }, []);

  const sort = useMemo(
    () => SORT_OPTIONS.find(option => option.id === sortId)?.api ?? null,
    [sortId],
  );

  const cart = useMemo(
    () => Object.fromEntries(cartItems.map(item => [item.id, item.quantity])),
    [cartItems],
  );

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map(item => item.id)),
    [wishlistItems],
  );

  const handleWishlist = useCallback(
    product => {
      dispatch(toggleWishlist(product));
    },
    [dispatch],
  );

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
          return 'ignored';
        }

        setProducts(data.products.map(normalizeProduct));
        setTotal(data.total);
        setLoadError(null);
        setStatus('idle');
        needsRefresh.current = Boolean(data.fromCache);

        return 'ok';
      } catch (error) {
        if (isRequestCanceled(error) || current !== generation.current) {
          return 'ignored';
        }

        console.log('LOAD FIRST PAGE ERROR:', error);
        needsRefresh.current = true;
        if (!hasProducts.current) {
          setLoadError({
            message: error.message,
            isNetwork: Boolean(error.isNetworkError),
          });
          setStatus('error');
        }

        return 'error';
      }
    },
    [fetchPage],
  );

  const loadCategories = useCallback(async signal => {
    try {
      const data = await getCategories(signal);
      setCategories((data ?? []).map(toCategory));
    } catch {
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    hasProducts.current = false;
    setStatus('loading');
    setLoadError(null);
    setProducts([]);
    setTotal(0);

    loadFirstPage(controller.signal);

    return () => controller.abort();
  }, [loadFirstPage]);

  useEffect(() => {
    const controller = new AbortController();

    loadCategories(controller.signal);

    return () => controller.abort();
  }, [loadCategories]);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      return;
    }

    if (!wasOffline.current) {
      return;
    }

    wasOffline.current = false;
    loadCategories();

    if (needsRefresh.current) {
      loadFirstPage();
    }
  }, [isOffline, loadFirstPage, loadCategories]);

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
      // Existing products rehne do. User dobara scroll karega to retry hoga.
    } finally {
      if (current === generation.current) {
        loadMoreLock.current = false;
        setLoadingMore(false);
      }
    }
  }, [status, products.length, total, fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const result = await loadFirstPage();

      if (result === 'error') {
        Toast.show({
          type: 'error',
          text1: 'Could not refresh',
          text2: 'Check your connection and try again.',
        });
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadFirstPage]);

  const retry = useCallback(() => {
    setStatus('loading');
    setLoadError(null);
    loadFirstPage();
  }, [loadFirstPage]);

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

  const handleAddToCart = useCallback(
    product => {
      dispatch(addToCart(product));
    },
    [dispatch],
  );

  const handleIncrement = useCallback(
    product => {
      dispatch(incrementQuantity(product.id));
    },
    [dispatch],
  );

  const handleDecrement = useCallback(
    product => {
      dispatch(decrementQuantity(product.id));
    },
    [dispatch],
  );

  const gridData = useMemo(
    () => (products.length % 2 === 1 ? [...products, SPACER] : products),
    [products],
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item.isSpacer) {
        return <View className="mx-1.5 flex-1" />;
      }

      return (
        <ProductSection
          product={item}
          quantity={cart[item.id] ?? 0}
          isWishlisted={wishlistIds.has(item.id)}
          onWishlist={handleWishlist}
          onPress={handleProductPress}
          onAddToCart={handleAddToCart}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      );
    },
    [
      cart,
      wishlistIds,
      handleWishlist,
      handleProductPress,
      handleAddToCart,
      handleIncrement,
      handleDecrement,
    ],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <View onLayout={handleGreetingLayout}>
          <Greeting />
        </View>
        <View style={{ height: controlsHeight }} />
      </View>
    ),
    [handleGreetingLayout, controlsHeight],
  );

  const emptyState = useMemo(() => {
    if (status === 'loading') {
      return (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (status === 'error') {
      const isNetwork = Boolean(loadError?.isNetwork);

      return (
        <View className="items-center px-8 py-16">
          {isNetwork && <WifiOff size={36} color={colors.textMuted} />}

          <AppText variant="title" className="mt-3 text-center text-base">
            {isNetwork ? 'No internet connection' : 'Something went wrong'}
          </AppText>

          <AppText
            variant="caption"
            color={colors.textSecondary}
            className="mb-4 mt-1 text-center"
          >
            {isNetwork
              ? 'Connect to the internet and try again. Products you have already viewed will be available offline.'
              : 'Could not load products. Please try again.'}
          </AppText>

          <AppButton title="Retry" size="sm" onPress={retry} />
        </View>
      );
    }

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
  }, [status, loadError, colors, retry]);

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
    <AppSafeAreaView bottom={false} className="flex-1 bg-background">
      <View className="flex-1">
        <AppList
          data={gridData}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 14 }}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyState}
          ListFooterComponent={listFooter}
          onScroll={onScroll}
          scrollEventThrottle={16}
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
          initialNumToRender={6}
          windowSize={7}
          contentContainerClassName="pb-6"
        />

        <Animated.View
          pointerEvents="box-none"
          onLayout={handleControlsLayout}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            opacity: greetingHeight > 0 ? 1 : 0,
            transform: [{ translateY: controlsTranslateY }],
          }}
        >
          <StickyControls
            query={query}
            onSearch={handleSearch}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            sortActive={sortId !== 'relevance'}
            onOpenSort={handleOpenSort}
          />
        </Animated.View>
      </View>

      <SortSheet
        visible={sortVisible}
        selectedId={sortId}
        onSelect={handleSelectSort}
        onClose={handleCloseSort}
      />
    </AppSafeAreaView>
  );
};

export default HomeScreen;

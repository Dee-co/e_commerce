import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react-native';

import { useDispatch, useSelector } from 'react-redux';

import AppText from '../../components/ui/AppText';
import { useTheme } from '../../context/ThemeContext';
import { getProductById } from '../../services/productService';
import { normalizeProduct } from '../../utils/normalizeProduct';

import { setCartItemQuantity } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';

const formatPrice = value => `₹${Number(value ?? 0).toLocaleString('en-IN')}`;

const ProductDetailsScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();

  const wishlistItems = useSelector(state => state.wishlist.items ?? []);

  const cartItems = useSelector(state => state.cart.items ?? []);

  const productId = route?.params?.productId ?? route?.params?.product?.id;

  const [product, setProduct] = useState(route?.params?.product ?? null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const cartItem = cartItems.find(
    item => String(item.id) === String(product?.id),
  );

  const isInCart = Boolean(cartItem);

  const isFavourite = wishlistItems.some(
    item => String(item.id) === String(product?.id),
  );
  const loadProduct = useCallback(
    async signal => {
      if (productId == null) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await getProductById(productId, signal);

        if (signal?.aborted) return;

        setProduct(normalizeProduct(data));
        setSelectedImage(0);
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') {
          return;
        }

        setError('Unable to load product details. Please try again.');
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [productId],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadProduct(controller.signal);

    return () => controller.abort();
  }, [loadProduct]);
  useEffect(() => {
    if (!product?.id) return;

    const existingItem = cartItems.find(
      item => String(item.id) === String(product.id),
    );

    const existingQuantity = Number(existingItem?.quantity);

    setQuantity(existingItem ? Math.max(1, existingQuantity || 1) : 1);
  }, [product?.id, cartItems]);

  const images = useMemo(() => {
    if (!product) return [];

    const list = product.images?.length
      ? product.images
      : [
          product.thumbnail,
          product.image?.url,
          product.image,
          product.variants?.[0]?.image?.url,
        ];

    return [
      ...new Set(
        list.filter(image => typeof image === 'string' && image.length > 0),
      ),
    ];
  }, [product]);

  const price = Number(
    product?.price?.min ??
      product?.price ??
      product?.variants?.[0]?.price?.min ??
      product?.variants?.[0]?.price ??
      0,
  );

  const discountPercentage = Number(product?.discountPercentage ?? 0);

  const originalPrice =
    discountPercentage > 0 && discountPercentage < 100
      ? price / (1 - discountPercentage / 100)
      : price;

  const rating = Number(product?.rating?.value ?? product?.rating ?? 0);

  const stock = Math.max(0, Number(product?.stock ?? 0));

  const available = product?.available !== false && stock > 0;

  const titleClass = isDark ? 'text-[#F0FDF4]' : 'text-[#14291C]';

  const secondaryClass = isDark ? 'text-[#B3C9BA]' : 'text-[#526B5A]';

  const cardClass = isDark
    ? 'border-[#294536] bg-[#12251B]'
    : 'border-[#D8E7DC] bg-white';

  const sectionClass = `rounded-2xl border p-4 ${cardClass}`;
  const handleToggleWishlist = () => {
    if (!product) return;

    dispatch(toggleWishlist(product));

    Alert.alert(
      isFavourite ? 'Removed from Wishlist' : 'Added to Wishlist',
      isFavourite
        ? 'Product removed from your wishlist.'
        : 'Product added to your wishlist.',
    );
  };
  const saveCartQuantity = () => {
    if (!product || !available) return false;

    if (quantity < 1 || quantity > stock) {
      Alert.alert(
        'Invalid quantity',
        `You can select between 1 and ${stock} items.`,
      );

      return false;
    }

    dispatch(
      setCartItemQuantity({
        product,
        quantity,
      }),
    );

    return true;
  };
  const handleAddToCart = () => {
    if (!product || !available) return;

    if (isInCart) {
      navigation.navigate('MainTabs', {
        screen: 'Cart',
      });

      return;
    }

    if (!saveCartQuantity()) return;

    Alert.alert(
      'Added to Cart',
      `${product.title ?? product.name} (${quantity}) added to your cart.`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Cart',
          onPress: () =>
            navigation.navigate('MainTabs', {
              screen: 'Cart',
            }),
        },
      ],
    );
  };

  const handleBuyNow = () => {
    if (!product || !available) return;

    if (!saveCartQuantity()) return;

    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />

        <AppText className={`mt-3 ${secondaryClass}`}>
          Loading product details...
        </AppText>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-background px-5">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-3 h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <AppText variant="title" className="text-center text-lg">
            Something went wrong
          </AppText>

          <AppText
            color={colors.textSecondary}
            className="mb-5 mt-2 text-center"
          >
            {error || 'Product not found.'}
          </AppText>

          <Pressable
            onPress={() => {
              const controller = new AbortController();
              loadProduct(controller.signal);
            }}
            className="rounded-xl bg-primary px-6 py-3"
          >
            <AppText color={colors.onPrimary} className="font-semibold">
              Try again
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>

        <AppText variant="title" className="text-base">
          Product Details
        </AppText>

        <Pressable
          onPress={handleToggleWishlist}
          accessibilityRole="button"
          accessibilityLabel={
            isFavourite ? 'Remove from favourites' : 'Add to favourites'
          }
          className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Heart
            size={21}
            color={isFavourite ? colors.error : colors.textPrimary}
            fill={isFavourite ? colors.error : 'transparent'}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-6"
      >
        {/* Main product image */}
        <View
          className={`relative mt-2 overflow-hidden rounded-3xl ${
            isDark ? 'bg-[#1B3528]' : 'bg-[#E8F4EB]'
          }`}
        >
          {images.length > 0 ? (
            <Image
              source={{ uri: images[selectedImage] }}
              resizeMode="contain"
              className="h-[300px] w-full"
            />
          ) : (
            <View className="h-[300px] items-center justify-center">
              <AppText color={colors.textMuted}>No image available</AppText>
            </View>
          )}

          {discountPercentage > 0 && (
            <View className="absolute left-4 top-4 rounded-lg bg-primary px-3 py-2">
              <AppText color={colors.onPrimary} className="font-bold">
                {Math.round(discountPercentage)}% OFF
              </AppText>
            </View>
          )}

          <View className="absolute right-4 top-4 flex-row items-center rounded-lg bg-surface px-3 py-2">
            <Star size={15} color={colors.warning} fill={colors.warning} />

            <AppText className="ml-1 font-semibold">
              {rating.toFixed(1)}
            </AppText>
          </View>
        </View>

        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerClassName="gap-3"
          >
            {images.map((image, index) => (
              <Pressable
                key={`${image}-${index}`}
                onPress={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-xl border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-border'
                }`}
              >
                <Image
                  source={{ uri: image }}
                  resizeMode="cover"
                  className="h-[72px] w-[72px] bg-surface"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View className="mt-5">
          {!!product.brand && (
            <AppText
              className={`text-sm font-semibold uppercase tracking-wider ${secondaryClass}`}
            >
              {product.brand}
            </AppText>
          )}

          <AppText
            variant="title"
            className={`mt-1 text-2xl font-bold ${titleClass}`}
          >
            {product.title ?? product.name}
          </AppText>

          <View className="mt-3 flex-row items-center">
            <Star size={16} color={colors.warning} fill={colors.warning} />

            <AppText className={`ml-1 font-semibold ${titleClass}`}>
              {rating.toFixed(1)}
            </AppText>

            <AppText className={`ml-2 ${secondaryClass}`}>
              ({product.reviews?.length ?? 0} reviews)
            </AppText>

            <View className="mx-2 h-1 w-1 rounded-full bg-border" />

            <AppText className={available ? 'text-green-600' : 'text-red-500'}>
              {available ? `${stock} in stock` : 'Out of stock'}
            </AppText>
          </View>

          <View className="mt-4 flex-row items-baseline">
            <AppText
              variant="title"
              className={`text-3xl font-bold ${titleClass}`}
            >
              {formatPrice(price)}
            </AppText>

            {discountPercentage > 0 && (
              <>
                <AppText
                  className={`ml-3 text-base line-through ${secondaryClass}`}
                >
                  {formatPrice(originalPrice)}
                </AppText>

                <AppText className="ml-2 text-sm font-semibold text-green-600">
                  Save {Math.round(discountPercentage)}%
                </AppText>
              </>
            )}
          </View>

          <AppText className={`mt-1 text-xs ${secondaryClass}`}>
            Price is returned by DummyJSON in USD; this display currently uses
            ₹.
          </AppText>
        </View>

        <View className={`mt-5 ${sectionClass}`}>
          <AppText variant="title" className="mb-2 text-base">
            Product description
          </AppText>

          <AppText color={colors.textSecondary} className="leading-6">
            {product.description || 'No description available.'}
          </AppText>

          {!!product.category && (
            <View className="mt-3 flex-row items-center">
              <AppText color={colors.textMuted}>Category:</AppText>

              <AppText className="ml-2 font-medium">
                {product.category.name ?? product.category}
              </AppText>
            </View>
          )}
        </View>

        <View className={`mt-4 gap-4 ${sectionClass}`}>
          <View className="flex-row items-start">
            <Truck size={22} color={colors.primary} />

            <View className="ml-3 flex-1">
              <AppText variant="button">Shipping information</AppText>

              <AppText color={colors.textSecondary} className="mt-1">
                {product.shippingInformation ||
                  'Check shipping availability at checkout.'}
              </AppText>
            </View>
          </View>

          <View className="flex-row items-start">
            <RotateCcw size={22} color={colors.primary} />

            <View className="ml-3 flex-1">
              <AppText variant="button">Return policy</AppText>

              <AppText color={colors.textSecondary} className="mt-1">
                {product.returnPolicy || 'See return policy at checkout.'}
              </AppText>
            </View>
          </View>

          <View className="flex-row items-start">
            <ShieldCheck size={22} color={colors.primary} />

            <View className="ml-3 flex-1">
              <AppText variant="button">Warranty</AppText>

              <AppText color={colors.textSecondary} className="mt-1">
                {product.warrantyInformation ||
                  'Warranty information not available.'}
              </AppText>
            </View>
          </View>
        </View>

        <View
          className={`mt-4 flex-row items-center justify-between ${sectionClass}`}
        >
          <View className="flex-1 pr-2">
            <AppText variant="button">Quantity</AppText>

            <AppText color={colors.textSecondary} className="mt-1 text-xs">
              {isInCart ? 'Current cart quantity' : 'Select how many you need'}
            </AppText>
          </View>

          <View className="flex-row items-center rounded-xl border border-border">
            <Pressable
              onPress={() => setQuantity(value => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              className="h-10 w-10 items-center justify-center"
            >
              <Minus
                size={17}
                color={quantity <= 1 ? colors.textMuted : colors.textPrimary}
              />
            </Pressable>

            <AppText className="min-w-8 text-center font-semibold">
              {quantity}
            </AppText>

            <Pressable
              onPress={() => setQuantity(value => Math.min(stock, value + 1))}
              disabled={!available || quantity >= stock}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              className="h-10 w-10 items-center justify-center"
            >
              <Plus
                size={17}
                color={
                  !available || quantity >= stock
                    ? colors.textMuted
                    : colors.textPrimary
                }
              />
            </Pressable>
          </View>
        </View>

        {/* Customer reviews */}
        {product.reviews?.length > 0 && (
          <View className={`mt-4 ${sectionClass}`}>
            <AppText variant="title" className="mb-3 text-base">
              Customer reviews
            </AppText>

            {product.reviews.slice(0, 3).map((review, index) => (
              <View
                key={`${
                  review.reviewerEmail ?? review.reviewerName ?? 'customer'
                }-${index}`}
                className={`py-3 ${index > 0 ? 'border-t border-border' : ''}`}
              >
                <View className="flex-row items-center justify-between">
                  <AppText variant="button">
                    {review.reviewerName ?? 'Customer'}
                  </AppText>

                  <View className="flex-row items-center">
                    <Star
                      size={13}
                      color={colors.warning}
                      fill={colors.warning}
                    />

                    <AppText className="ml-1 text-sm">
                      {review.rating}/5
                    </AppText>
                  </View>
                </View>

                {!!review.comment && (
                  <AppText
                    color={colors.textSecondary}
                    className="mt-2 leading-5"
                  >
                    {review.comment}
                  </AppText>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="border-t border-border bg-background px-5 py-3">
        <View className="mb-3 flex-row items-center justify-between">
          <AppText color={colors.textSecondary}>Total price</AppText>

          <AppText variant="title" className="text-xl">
            {formatPrice(price * quantity)}
          </AppText>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={handleAddToCart}
            disabled={!available}
            className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${
              available ? 'bg-primary active:opacity-80' : 'bg-neutral-400'
            }`}
          >
            <ShoppingCart size={18} color={colors.onPrimary} />

            <AppText color={colors.onPrimary} className="font-bold">
              {!available
                ? 'Out of Stock'
                : isInCart
                ? 'Go to Cart'
                : 'Add to Cart'}
            </AppText>
          </Pressable>

          <Pressable
            onPress={handleBuyNow}
            disabled={!available}
            className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${
              available ? 'bg-[#D1FAE5] active:opacity-80' : 'bg-neutral-300'
            }`}
          >
            <Zap size={18} color="#065F46" />

            <AppText color="#065F46" className="font-bold">
              Buy Now
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;

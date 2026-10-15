
import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AppList from '../../components/ui/AppList';
import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import { useTheme } from '../../context/ThemeContext';

import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';

const getProductPrice = product => {
  const price = product?.price;

  if (typeof price === 'number' || typeof price === 'string') {
    const parsed = Number(price);
    if (Number.isFinite(parsed)) return parsed;
  }

  if (price && typeof price === 'object') {
    const parsed = Number(price.min ?? price.max);

    if (Number.isFinite(parsed)) return parsed;
  }

  const variantPrice = Number(product?.variants?.[0]?.price);

  return Number.isFinite(variantPrice) ? variantPrice : 0;
};

const getProductCurrency = product =>
  product?.price?.currency ||
  product?.variants?.[0]?.currency ||
  product?.currency ||
  'USD';

const formatPrice = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    return `${currency} ${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
  }
};

const getProductImage = product => {
  const image = product?.image;

  const candidate =
    (typeof image === 'string' ? image : image?.url) ||
    product?.thumbnail ||
    product?.images?.[0] ||
    product?.variants?.[0]?.image?.url;

  return typeof candidate === 'string' &&
    /^https?:\/\//i.test(candidate)
    ? candidate
    : null;
};

const WishlistScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const wishlist = useSelector(state => state.wishlist.items);
  const openProduct = item => {
    navigation.navigate('ProductDetails', {
      productId: item.id,
      product: item,
    });
  };
  const confirmRemove = item => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove ${item.name || item.title || 'Product'} from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(toggleWishlist(item)),
        },
      ],
    );
  };

  const handleAddToCart = item => {
    dispatch(addToCart(item));

    Alert.alert(
      'Added to Cart',
      `${item.name || item.title || 'Product'} added to your cart.`,
    );
  };

  const renderItem = ({ item }) => {
    const productName = item.name || item.title || 'Product';
    const imageUrl = getProductImage(item);
    const price = getProductPrice(item);
    const currency = getProductCurrency(item);

    return (
      <Pressable
        onPress={() => openProduct(item)}
        className="mb-4 flex-row rounded-2xl border p-3"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <View className="h-28 w-24 overflow-hidden rounded-xl bg-surfaceLight">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="h-full w-full"
              resizeMode="contain"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Heart size={28} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View className="ml-3 flex-1 justify-between">
          <View>
            <AppText
              variant="body"
              numberOfLines={2}
              className="text-base font-semibold"
            >
              {productName}
            </AppText>

            <AppText
              variant="heading"
              className="mt-2 text-lg font-bold"
              color={colors.primary}
            >
              {formatPrice(price, currency)}
            </AppText>
          </View>

          <View className="mt-3 flex-row items-center">
            <View className="flex-1">
              <AppButton
                title="Add to Cart"
                size="sm"
                fullWidth
                leftIcon={
                  <ShoppingCart
                    size={16}
                    color={colors.white}
                  />
                }
                onPress={() => handleAddToCart(item)}
              />
            </View>

            <AppButton
              variant="icon"
              size="sm"
              icon={
                <Trash2
                  size={18}
                  color={colors.danger || colors.primary}
                />
              }
              onPress={() => confirmRemove(item)}
              accessibilityLabel={`Remove ${productName} from wishlist`}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyWishlist = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="mb-5 h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.surfaceLight }}
      >
        <Heart size={42} color={colors.primary} />
      </View>

      <AppText
        variant="title"
        className="text-center text-xl font-bold"
      >
        Your wishlist is empty
      </AppText>

      <AppText
        className="mt-2 text-center"
        color={colors.textMuted}
      >
        Save your favourite products here to find them easily later.
      </AppText>

      <View className="mt-6 w-full">
        <AppButton
          title="Explore Products"
          size="md"
          fullWidth
          leftIcon={
            <ShoppingCart
              size={18}
              color={colors.white}
            />
          }
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </View>
  );

  return (
    <AppSafeAreaView className="flex-1" bottom={false}>
      <View className="flex-row items-center justify-between px-5  pt-1 pb-4">
        <View>
          <AppText variant="title" className="text-2xl font-bold">
            My Wishlist
          </AppText>

          <AppText
            variant="bodySmall"
            color={colors.textSecondary}
            className="mt-1"
          >
            {wishlist.length}{' '}
            {wishlist.length === 1 ? 'product' : 'products'}
          </AppText>
        </View>

        <Heart size={25} color={colors.primary} />
      </View>

      <View className="flex-1">
        {wishlist.length === 0 ? (
          renderEmptyWishlist()
        ) : (
          <AppList
            data={wishlist}
            renderItem={renderItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default WishlistScreen;

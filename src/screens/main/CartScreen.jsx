import React, { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { ShoppingCart, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';

import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AppQuantityButton from '../../components/ui/AppQuantityButton';
import { useTheme } from '../../context/ThemeContext';

import {
  clearCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import { cancelCartReminder } from '../../services/notificationService';
import AppList from '../../components/ui/AppList';
import { useNavigation } from '@react-navigation/native';
import AppImage from '../../components/ui/AppImage';

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

// Rupee symbol seedha lagaya hai, currency code ki zaroorat nahi
const formatPrice = amount => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  try {
    return `₹${safeAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `₹${safeAmount.toFixed(2)}`;
  }
};

const getProductImage = product => {
  const image = product?.image;

  const url = typeof image === 'string' ? image : image?.url;

  const candidate =
    url ||
    product?.thumbnail ||
    product?.images?.[0] ||
    product?.variants?.[0]?.image?.url;

  return typeof candidate === 'string' && /^https?:\/\//i.test(candidate)
    ? candidate
    : null;
};

const CartScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);

  const [movingProductId, setMovingProductId] = useState(null);

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0,
      ),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const price = getProductPrice(item);
        const quantity = Number(item.quantity) || 0;
        return total + price * quantity;
      }, 0),
    [cartItems],
  );

  const completePurchase = () => {
    dispatch(clearCart());
    cancelCartReminder();

    Toast.show({
      type: 'success',
      text1: 'Order placed',
      text2: 'Thank you for shopping with us.',
    });
  };

  const handleCheckout = () => {
    Alert.alert(
      'Place order',
      `Pay ${formatPrice(subtotal)} for ${totalItems} ${totalItems === 1 ? 'item' : 'items'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Place Order', onPress: completePurchase },
      ],
    );
  };

  const confirmRemove = product => {
    const alreadyWishlisted = wishlistItems.some(
      item => item.id === product.id,
    );

    const buttons = [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => dispatch(removeFromCart(product.id)),
      },
    ];

    if (!alreadyWishlisted) {
      buttons.push({
        text: 'Move to Wishlist',
        onPress: () => {
          dispatch(toggleWishlist(product));
          dispatch(removeFromCart(product.id));
        },
      });
    }

    Alert.alert(
      'Remove product',
      `What would you like to do with ${product.name || product.title}?`,
      buttons,
      { cancelable: true },
    );
  };

  const renderItem = ({ item }) => {
    const imageUrl = getProductImage(item);
    const productName = item.name || item.title || 'Product';
    const price = getProductPrice(item);
    const quantity = Number(item.quantity) || 0;
    const itemTotal = price * quantity;

    return (
      <View className="mb-4 flex-row rounded-2xl border border-border bg-surface p-3">
        <View className="h-28 w-24 overflow-hidden rounded-xl bg-surfaceLight">
          <AppImage uri={imageUrl} resizeMode="contain" className="h-full w-full" />
        </View>

        <View className="ml-3 flex-1 justify-between">
          <View>
            <AppText variant="title" numberOfLines={2} className="text-sm">
              {productName}
            </AppText>

            <AppText
              variant="caption"
              color={colors.textSecondary}
              className="mt-1"
            >
              {formatPrice(price)} each
            </AppText>

            <AppText variant="title" color={colors.primary} className="mt-1">
              {formatPrice(itemTotal)}
            </AppText>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <AppQuantityButton
              quantity={quantity}
              onIncrement={() => dispatch(incrementQuantity(item.id))}
              onDecrement={() => dispatch(decrementQuantity(item.id))}
              size="sm"
            />

            <Pressable
              onPress={() => confirmRemove(item)}
              disabled={movingProductId === item.id}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${productName} from cart`}
              hitSlop={8}
              className="ml-2 h-10 w-10 items-center justify-center rounded-xl"
            >
              <Trash2 size={19} color={colors.danger || '#EF4444'} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AppSafeAreaView bottom={false}>
      <View className="flex-1 px-5">
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <AppText variant="title">My Cart</AppText>
            <AppText
              variant="bodySmall"
              color={colors.textSecondary}
              className="mt-1"
            >
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </AppText>
          </View>

          <ShoppingCart size={25} color={colors.primary} />
        </View>

        {cartItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <View
              className="mb-5 h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceLight }}
            >
              <ShoppingCart size={42} color={colors.primary} />
            </View>

            <AppText variant="title" className="text-center font-bold">
              Empty Cart
            </AppText>

            <AppText className="mt-2 text-center" color={colors.textMuted}>
              Add products from Home to get started.
            </AppText>

            <View className="mt-6 w-full">
              <AppButton
                title="Explore Products"
                size="md"
                fullWidth
                leftIcon={<ShoppingCart size={18} color={colors.white} />}
                onPress={() => navigation.navigate('Home')}
              />
            </View>
          </View>
        ) : (
          <View className="flex-1">
            <AppList
              data={cartItems}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />

            <View className="border-t border-border bg-background pb-4 pt-4">
              <View className="mb-2 flex-row justify-between">
                <AppText variant="bodySmall" color={colors.textSecondary}>
                  Subtotal ({totalItems} items)
                </AppText>

                <AppText variant="bodySmall">{formatPrice(subtotal)}</AppText>
              </View>

              <View className="mb-4 flex-row justify-between">
                <AppText variant="title">Total</AppText>

                <AppText variant="title" color={colors.primary}>
                  {formatPrice(subtotal)}
                </AppText>
              </View>

              <AppButton
                title="Proceed to Checkout"
                fullWidth
                onPress={handleCheckout}
              />
            </View>
          </View>
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default CartScreen;
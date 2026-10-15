import React, { memo } from 'react';
import { Image, Pressable, View } from 'react-native';
import {
  Heart,
  ImageOff,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react-native';
import AppText from '../../../../components/ui/AppText';
import AppButton from '../../../../components/ui/AppButton';
import AppQuantityButton from '../../../../components/ui/AppQuantityButton';
import { useTheme } from '../../../../context/ThemeContext';
import { useDispatch } from 'react-redux';
const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 3,
};
const toTitleCase = (text = '') =>
  text
    .trim()
    .replace(
      /\w\S*/g,
      word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );

const formatPrice = value => `₹${Number(value ?? 0).toLocaleString('en-IN')}`;

const getUnitLabel = variant => {
  const unitValue = Number(variant?.unitValue ?? 0);
  const unit = variant?.unit?.value;

  if (!unitValue || !unit) {
    return '';
  }

  if (unit === 'pc') {
    return `${unitValue} ${unitValue > 1 ? 'pcs' : 'pc'}`;
  }

  if (unit === 'set') {
    return `${unitValue} ${unitValue > 1 ? 'sets' : 'set'}`;
  }

  return `${unitValue} ${variant?.unit?.label ?? unit}`;
};

const ProductSection = ({
  product,
  quantity = 0,
  onPress,
  isWishlisted = false,
  onWishlist,
  onAddToCart,
  onIncrement,
  onDecrement,
}) => {
  const { colors } = useTheme();
  const minPrice = Number(product?.price?.min ?? 0);
  const maxPrice = Number(product?.price?.max ?? minPrice);
  const hasPriceRange = maxPrice > minPrice;
  const variants = product?.variants ?? [];
  const hasOptions = variants.length > 1;
  const rating = Number(product?.rating?.value ?? 0);
  const imageUrl = product?.image?.url;
  const isAvailable = product?.available !== false;
  const compareAtPrice = hasOptions
    ? 0
    : Number(variants[0]?.compareAtPrice ?? 0);
  const discount =
    compareAtPrice > minPrice
      ? Math.round(((compareAtPrice - minPrice) / compareAtPrice) * 100)
      : 0;
  const metaText = hasOptions
    ? `${variants.length} options`
    : getUnitLabel(variants[0]);

  const renderAction = () => {
    if (!isAvailable) {
      return (
        <AppButton
          title="Out of stock"
          variant="outline"
          size="sm"
          disabled
          className="h-10"
          textClassName="text-sm"
        />
      );
    }
    if (quantity > 0) {
      return (
        <AppQuantityButton
          quantity={quantity}
          min={0}
          size="sm"
          onDecrement={() => onDecrement?.(product)}
          onIncrement={() => onIncrement?.(product)}
        />
      );
    }

    return (
      <AppButton
        title="Add to cart"
        size="sm"
        onPress={() => onAddToCart?.(product)}
        leftIcon={<ShoppingCart size={16} color={colors.white} />}
        className="h-10 px-2"
        textClassName="text-sm"
      />
    );
  };

  return (
    <View
      className="mx-1.5 mb-3.5 flex-1 rounded-2xl bg-surface"
      style={SHADOW}
    >
      <Pressable
        onPress={() => onPress?.(product)}
        accessibilityRole="button"
        accessibilityLabel={product?.name}
        className="grow overflow-hidden rounded-2xl border border-border active:opacity-[0.94]"
      >
        <View className="aspect-[1.15] items-center justify-center bg-surfaceLight">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              resizeMode="cover"
              className="h-full w-full"
            />
          ) : (
            <ImageOff size={28} color={colors.textMuted} />
          )}
          {!isAvailable && (
            <View
              pointerEvents="none"
              className="absolute inset-0 items-center justify-center bg-black/[0.45]"
            >
              <View className="rounded-full bg-black/75 px-3 py-1">
                <AppText
                  variant="caption"
                  color="#FFFFFF"
                  className="font-app-semibold"
                >
                  Currently unavailable
                </AppText>
              </View>
            </View>
          )}
          {isAvailable && discount > 0 && (
            <View className="absolute left-2 top-2 rounded-lg bg-primary px-2 py-[3px]">
              <AppText
                variant="caption"
                color={colors.white}
                className="font-app-semibold"
              >
                {discount}% OFF
              </AppText>
            </View>
          )}
          {rating > 0 && (
            <View className="absolute right-2 bottom-2 flex-row items-center rounded-lg bg-surface px-1.5 py-[3px]">
              <Star size={12} color={colors.primary} fill={colors.primary} />
              <AppText variant="caption" className="ml-[3px] font-app-semibold">
                {rating.toFixed(1)}
              </AppText>
            </View>
          )}
        </View>
        <Pressable
          onPress={() => onWishlist?.(product)}
          accessibilityRole="button"
          accessibilityLabel={
            isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
          }
          accessibilityState={{ selected: isWishlisted }}
          hitSlop={6}
          className="absolute right-2 top-2 z-10 h-9 w-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Heart
            size={19}
            color={isWishlisted ? colors.error : colors.textSecondary}
            fill={isWishlisted ? colors.error : 'transparent'}
          />
        </Pressable>
        <View className="grow justify-between p-3">
          <View>
            <AppText
              variant="bodySmallBold"
              numberOfLines={2}
              className="min-h-[42px] text-[15px] leading-[21px]"
            >
              {product?.name ?? 'Untitled product'}
            </AppText>

            {!!product?.brand && (
              <AppText
                variant="caption"
                color={colors.textSecondary}
                numberOfLines={1}
                className="mt-0.5"
              >
                {toTitleCase(product.brand)}
              </AppText>
            )}

            {!!metaText && (
              <AppText
                variant="caption"
                color={colors.textMuted}
                numberOfLines={1}
                className="mt-0.5"
              >
                {metaText}
              </AppText>
            )}

            {/* Price */}
            <View className="mt-2 flex-row items-baseline">
              <AppText variant="title" className="text-[17px]">
                {formatPrice(minPrice)}
              </AppText>

              {hasPriceRange && (
                <AppText
                  variant="caption"
                  color={colors.textMuted}
                  className="ml-1"
                >
                  onwards
                </AppText>
              )}

              {discount > 0 && !hasPriceRange && (
                <AppText
                  variant="caption"
                  color={colors.textMuted}
                  className="ml-1.5 line-through"
                >
                  {formatPrice(compareAtPrice)}
                </AppText>
              )}
            </View>
          </View>
          <View className="mt-3">{renderAction()}</View>
        </View>
      </Pressable>
    </View>
  );
};

export default memo(ProductSection);

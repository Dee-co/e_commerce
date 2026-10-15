import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
} from 'react-native';

import AppText from './AppText';
import { useTheme } from '../../context/ThemeContext';

const SIZES = {
  sm: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    icon: 42,
  },
  md: {
    height: 54,
    paddingHorizontal: 20,
    borderRadius: 12,
    icon: 48,
  },
  lg: {
    height: 60,
    paddingHorizontal: 24,
    borderRadius: 14,
    icon: 58,
  },
};

const getVariantStyles = (variant, colors) => {
  switch (variant) {
    case 'outline':
      return {
        backgroundColor: colors.transparent,
        borderColor: colors.primary,
        textColor: colors.primary,
      };

    case 'ghost':
      return {
        backgroundColor: colors.transparent,
        borderColor: colors.transparent,
        textColor: colors.primary,
      };

    case 'danger':
      return {
        backgroundColor: colors.error,
        borderColor: colors.error,
        textColor: colors.white,
      };

    case 'icon':
      return {
        backgroundColor: colors.surfaceLight,
        borderColor: colors.border,
        textColor: colors.primary,
      };

    case 'filled':
    default:
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        textColor: colors.white,
      };
  }
};

const AppButton = ({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  icon,
  fullWidth = true,
  style,
  textStyle,
  ...props
}) => {
  const {colors} = useTheme();

  const isIcon = variant === 'icon';
  const isDisabled = disabled || loading;

  const sizeConfig = SIZES[size] || SIZES.md;
  const v = getVariantStyles(variant, colors);

  const baseStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: v.borderColor,
    backgroundColor: v.backgroundColor,
    opacity: isDisabled ? 0.5 : 1,
  };

  if (isIcon) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          busy: loading,
        }}
        onPress={onPress}
        disabled={isDisabled}
        {...props}
        style={[
          baseStyle,
          {
            width: sizeConfig.icon,
            height: sizeConfig.icon,
            borderRadius: sizeConfig.borderRadius,
            alignSelf: 'flex-start',
          },
          style,
        ]}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={v.textColor}
          />
        ) : (
          icon
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      onPress={onPress}
      disabled={isDisabled}
      {...props}
      style={[
        baseStyle,
        {
          flexDirection: 'row',
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}>
      {loading ? (
        <>
          <ActivityIndicator
            size="small"
            color={v.textColor}
          />

          <AppText
            variant="button"
            color={v.textColor}
            style={{
              marginLeft: 8,
              includeFontPadding: false,
            }}>
            Loading...
          </AppText>
        </>
      ) : (
        <>
          {leftIcon ? (
            <View style={{marginRight: 8}}>
              {leftIcon}
            </View>
          ) : null}

          <AppText
            variant="button"
            color={v.textColor}
            numberOfLines={1}
            style={[
              {
                includeFontPadding: false,
                textAlignVertical: 'center',
              },
              textStyle,
            ]}>
            {title}
          </AppText>

          {rightIcon ? (
            <View style={{marginLeft: 8}}>
              {rightIcon}
            </View>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
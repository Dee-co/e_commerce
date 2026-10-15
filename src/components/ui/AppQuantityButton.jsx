import React from 'react';
import { View, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

import AppText from './AppText';
import { useTheme } from '../../context/ThemeContext';

const SIZES = {
  sm: {
    height: 35,
    paddingHorizontal: 10,
    iconSize: 16,
    text: 'text-sm',
    gap: 8,
    buttonWidth: 30,
    borderRadius: 10,
  },
  md: {
    height: 54,
    paddingHorizontal: 12,
    iconSize: 18,
    text: 'text-base',
    gap: 12,
    buttonWidth: 38,
    borderRadius: 12,
  },
  lg: {
    height: 60,
    paddingHorizontal: 14,
    iconSize: 20,
    text: 'text-lg',
    gap: 14,
    buttonWidth: 42,
    borderRadius: 14,
  },
};

const AppQuantityButton = ({
  quantity = 0,
  onIncrement,
  onDecrement,
  min = 0,
  max,
  disabled = false,
  size = 'md',
  style,
}) => {
  const { colors } = useTheme();

  const config = SIZES[size] ?? SIZES.md;

  const atMinimum = quantity <= min;
  const atMaximum = max !== undefined && quantity >= max;

  const getButtonStyle = isDisabled => ({
    width: config.buttonWidth,
    height: config.height - 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.transparent,
    opacity: isDisabled ? 0.45 : 1,
  });

  return (
    <View
      className="flex-row items-center justify-between"
      style={[
        {
          height: config.height,
          paddingHorizontal: config.paddingHorizontal,
          borderWidth: 1.5,
          borderColor: colors.primary,
          borderRadius: config.borderRadius,
          backgroundColor: colors.transparent,
        },
        style,
      ]}
    >
      <Pressable
        onPress={onDecrement}
        disabled={disabled || atMinimum}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{
          disabled: disabled || atMinimum,
        }}
        hitSlop={4}
        style={getButtonStyle(disabled || atMinimum)}
      >
        <Minus size={config.iconSize} color={colors.primary} />
      </Pressable>

      <View
        className="items-center justify-center"
        style={{ minWidth: 24, marginHorizontal: config.gap }}
      >
        <AppText
          variant="button"
          color={colors.primary}
          className={config.text}
        >
          {quantity}
        </AppText>
      </View>

      <Pressable
        onPress={onIncrement}
        disabled={disabled || atMaximum}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{
          disabled: disabled || atMaximum,
        }}
        hitSlop={4}
        style={getButtonStyle(disabled || atMaximum)}
      >
        <Plus size={config.iconSize} color={colors.primary} />
      </Pressable>
    </View>
  );
};

export default AppQuantityButton;

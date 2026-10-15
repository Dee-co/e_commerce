import React from 'react';
import { View } from 'react-native';

import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import { useTheme } from '../../context/ThemeContext';

const CartScreen = () => {
  const { colors } = useTheme();

  return (
    <AppSafeAreaView>
      <View className="flex-1 px-5 pt-6">
        <AppText variant="heading">
          My Cart
        </AppText>

        <View
          className="mt-8 items-center rounded-2xl border p-6"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <AppText variant="title">
            Your cart is empty
          </AppText>

          <AppText
            variant="bodySmall"
            color={colors.textSecondary}
            className="mt-2 text-center"
          >
            Add products from Home to get started.
          </AppText>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default CartScreen;
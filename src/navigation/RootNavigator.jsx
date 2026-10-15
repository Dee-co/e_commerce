import React from 'react';
import { StatusBar, View } from 'react-native';

import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import AuthNavigator from './AuthNavigator';

import { useTheme } from '../context/ThemeContext';

const RootNavigator = () => {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(!isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(!isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={!isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <NavigationContainer theme={navTheme}>
        <AuthNavigator />
      </NavigationContainer>
    </View>
  );
};

export default RootNavigator;
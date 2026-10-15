
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AppText from '../../components/ui/AppText';
import { useTheme } from '../../context/ThemeContext';

const SplashScreen = ({ navigation }) => {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="h-22 w-22 items-center justify-center rounded-3xl"
        style={{ backgroundColor: colors.primary }}
      >
        <AppText
          className="text-2xl font-extrabold"
          style={{ color: colors.white }}
        >
          APP
        </AppText>
      </View>

      <AppText
        className="mt-5 text-3xl font-bold"
        style={{ color: colors.textPrimary }}
      >
        Welcome
      </AppText>

      <AppText
        className="mt-2 text-sm"
        style={{ color: colors.textSecondary }}
      >
        Everything you need, in one place.
      </AppText>

      <ActivityIndicator
        size="small"
        color={colors.primary}
        className="mt-8"
      />
    </View>
  );
};

export default SplashScreen;

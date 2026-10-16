import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import {
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
} from 'lucide-react-native';

import AppText from '../../components/ui/AppText';
import { useTheme } from '../../context/ThemeContext';

const SPLASH_DURATION_MS = 2400;
const PROGRESS_WIDTH = 160;

const FEATURES = [
  { id: 'delivery', label: 'Fast delivery', Icon: Truck },
  { id: 'secure', label: 'Secure checkout', Icon: ShieldCheck },
  { id: 'deals', label: 'Smart deals', Icon: Tag },
];

const SplashScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(16)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(-PROGRESS_WIDTH)).current;

  useEffect(() => {
    const intro = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]);

    // Loading bar poore splash time mein bharti hai
    const loading = Animated.timing(progress, {
      toValue: 0,
      duration: SPLASH_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    intro.start();
    loading.start();

    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, SPLASH_DURATION_MS + 200);

    return () => {
      clearTimeout(timer);
      intro.stop();
      loading.stop();
    };
  }, [
    navigation,
    logoScale,
    logoOpacity,
    textOpacity,
    textTranslate,
    footerOpacity,
    progress,
  ]);

  return (
    <View
      className="flex-1 overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <View
        pointerEvents="none"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
        style={{ backgroundColor: colors.primary, opacity: 0.08 }}
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full"
        style={{ backgroundColor: colors.primary, opacity: 0.06 }}
      />
      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          className="items-center justify-center"
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <View
            className="absolute h-36 w-36 rounded-full"
            style={{ backgroundColor: colors.primary, opacity: 0.12 }}
          />

          <View
            className="h-24 w-24 items-center justify-center rounded-[28px]"
            style={{
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 10,
            }}
          >
            <ShoppingCart size={44} strokeWidth={2.2} color={colors.onPrimary} />
          </View>
        </Animated.View>

        <Animated.View
          className="mt-8 items-center"
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslate }],
          }}
        >
          <View className="flex-row items-baseline">
            <AppText
              className="text-4xl font-extrabold"
              color={colors.textPrimary}
            >
              Smart
            </AppText>
            <AppText
              className="text-4xl font-extrabold"
              color={colors.primary}
            >
              Cart
            </AppText>
          </View>

          <AppText
            className="mt-2 text-center text-base"
            color={colors.textSecondary}
          >
            Shop smarter. Save more.
          </AppText>
        </Animated.View>
        <View
          className="mt-10 h-1 overflow-hidden rounded-full"
          style={{ width: PROGRESS_WIDTH, backgroundColor: colors.border }}
        >
          <Animated.View
            className="h-1 rounded-full"
            style={{
              width: PROGRESS_WIDTH,
              backgroundColor: colors.primary,
              transform: [{ translateX: progress }],
            }}
          />
        </View>
      </View>

      <Animated.View
        className="flex-row justify-center px-6 pb-12"
        style={{ opacity: footerOpacity }}
      >
        {FEATURES.map(({ id, label, Icon }) => (
          <View key={id} className="mx-3 w-24 items-center">
            <View
              className="h-11 w-11 items-center justify-center rounded-full border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Icon size={20} color={colors.primary} />
            </View>

            <AppText
              variant="caption"
              className="mt-2 text-center"
              color={colors.textSecondary}
            >
              {label}
            </AppText>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
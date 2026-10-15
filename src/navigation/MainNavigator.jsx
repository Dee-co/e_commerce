import React from 'react';
import { Pressable, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Home, ShoppingCart, UserRound } from 'lucide-react-native';
import HomeScreen from '../screens/main/Home/HomeScreen';
import CartScreen from '../screens/main/CartScreen';
import ProductDetailsScreen from '../screens/main/ProductDetailsScreen';
import { useTheme } from '../context/ThemeContext';
import WishListScreen from '../screens/main/WishlistScreen';
import { useSelector } from 'react-redux';
import AppText from '../components/ui/AppText';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const NoFeedbackTabButton = ({
  children,
  onPress,
  onLongPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityState,
}) => (
  <Pressable
    onPress={onPress}
    onLongPress={onLongPress}
    testID={testID}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={accessibilityState}
    android_ripple={null}
    style={style}
  >
    {children}
  </Pressable>
);

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const cartItems = useSelector(state => state.cart.items);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
  const wishlistCount = wishlistItems.length;
  const renderTabIcon = (Icon, color, focused, count) => (
    <View className="relative">
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />

      {count > 0 && (
        <View
          className="absolute -right-3 -top-2 min-w-5 h-5 items-center justify-center rounded-full px-1"
          style={{
            backgroundColor: colors.danger || '#EF4444',
          }}
        >
          <AppText
            variant="caption"
            color="#FFFFFF"
            className="text-[10px] font-bold"
          >
            {count > 99 ? '99+' : count}
          </AppText>
        </View>
      )}
    </View>
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarButton: props => <NoFeedbackTabButton {...props} />,
        tabBarStyle: {
          height: 68 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Eina01-Regular',
          fontSize: 12,
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon(Home, color, focused, 0),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon(ShoppingCart, color, focused, cartCount),
        }}
      />

      <Tab.Screen
        name="Wishlist"
        component={WishListScreen}
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderTabIcon(Heart, color, focused, wishlistCount),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;

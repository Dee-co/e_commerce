import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';

import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Main"
        component={MainNavigator}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
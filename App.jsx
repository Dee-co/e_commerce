import './global.css';
import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import AppToast from './src/components/ui/AppToast';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { Provider } from 'react-redux';
import { persistor, store } from './src/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { useNetworkStatus } from './src/utils/network';
import { useCartReminder } from './src/hooks/useCartReminder';

const toastConfig = {
  success: props => <AppToast {...props} type="success" />,
  error: props => <AppToast {...props} type="error" />,
  info: props => <AppToast {...props} type="info" />,
};

// Internet jaane par toast dikhata hai (band nahi hota), wapas aane par hata deta hai
const NetworkWatcher = () => {
  const { isOffline } = useNetworkStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      Toast.show({
        type: 'error',
        text1: 'No internet connection',
        text2: 'Showing saved data where available.',
        autoHide: false,
      });
    } else if (wasOffline.current) {
      wasOffline.current = false;
      Toast.show({
        type: 'success',
        text1: 'Back online',
        visibilityTime: 2000,
      });
    }
  }, [isOffline]);

  return null;
};

const AppContent = () => {
  const { themeVars } = useTheme();

  // Abandoned-cart reminder: Provider aur PersistGate ke andar hona zaroori hai
  useCartReminder();

  return (
    <View style={vars(themeVars)} className="flex-1">
      <NetworkWatcher />
      <RootNavigator />
      <Toast config={toastConfig} />
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default App;
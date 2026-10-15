import './global.css';
import React from 'react';
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
const toastConfig = {
  success: props => <AppToast {...props} type="success" />,
  error: props => <AppToast {...props} type="error" />,
  info: props => <AppToast {...props} type="info" />,
};

const AppContent = () => {
  const { themeVars } = useTheme();

  return (
    <View style={vars(themeVars)} className="flex-1">
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

import './global.css';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import {AuthProvider} from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import AppToast from './src/components/ui/AppToast';
import {View} from 'react-native';
import {vars} from 'nativewind';

const toastConfig = {
  success: props => <AppToast {...props} type="success" />,
  error: props => <AppToast {...props} type="error" />,
  info: props => <AppToast {...props} type="info" />,
};

const AppContent = () => {
  const {themeVars} = useTheme();

  return (
    <View style={vars(themeVars)} className="flex-1">
      <AuthProvider>
        <RootNavigator />
        <Toast config={toastConfig} />
      </AuthProvider>
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default App;
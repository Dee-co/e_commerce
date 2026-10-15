import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';
const AppSafeAreaView = ({
  children,
  top = true,
  right = true,
  bottom = true,
  left = true,
  className = '',
  style,
}) => {
  const {colors} = useTheme();
  const edges = [
    ...(top ? ['top'] : []),
    ...(right ? ['right'] : []),
    ...(bottom ? ['bottom'] : []),
    ...(left ? ['left'] : []),
  ];

  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 ${className}`}
      style={[
        {
          backgroundColor: colors.background,
        },
        style,
      ]}>
      {children}
    </SafeAreaView>
  );
};

export default AppSafeAreaView;
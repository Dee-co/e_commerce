import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
const AppLoader = ({
  size = 'large',
  color,
  fullScreen = false,
  style,
}) => {
  const {colors} = useTheme();
  const indicatorColor = color || colors.primary;
  if (fullScreen) {
    return (
      <View
        style={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          },
          style,
        ]}>
        <ActivityIndicator
          size={size}
          color={indicatorColor}
        />
      </View>
    );
  }
  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        },
        style,
      ]}>
      <ActivityIndicator
        size={size}
        color={indicatorColor}
      />
    </View>
  );
};

export default AppLoader;
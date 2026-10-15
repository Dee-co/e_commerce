import React from 'react';
import { Image } from 'react-native';

const AppLogo = ({ size = 80 }) => {
  return (
    <Image
      source={require('../../assets/images/padosi-logo.png')}
      style={{
        width: size,
        height: size,
        resizeMode: 'contain',
      }}
    />
  );
};

export default AppLogo;
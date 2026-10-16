import React, { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { ImageOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
const fillStyle = { width: '100%', height: '100%' };
const AppImage = ({ uri, resizeMode = 'cover', className = '', iconSize = 28 }) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const showFallback = !uri || failed;

  return (
    <View
      className={`${className} ${showFallback ? 'items-center justify-center' : ''}`}
    >
      {showFallback ? (
        <ImageOff size={iconSize} color={colors.textMuted} />
      ) : (
        <FastImage
          style={fillStyle}
          source={{
            uri,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode[resizeMode]}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
};

export default memo(AppImage);
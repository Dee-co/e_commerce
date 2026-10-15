import React from 'react';
import {TextInput, View, Pressable} from 'react-native';
import AppText from './AppText';
import {fonts} from '../../theme';
import {useTheme} from '../../context/ThemeContext';
const AppInput = ({
  label,
  required = false,
  error,
  variant = 'default',
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  value,
  onChangeText,
  type = 'text',
  keyboardType,
  ...props
}) => {
  const {colors} = useTheme();
  const isFilled = variant === 'filled';
  const hasError = Boolean(error);
  const getKeyboardType = () => {
    if (keyboardType) {
      return keyboardType;
    }
    switch (type) {
      case 'email':
        return 'email-address';

      case 'number':
        return 'numeric';

      case 'phone':
        return 'phone-pad';

      default:
        return 'default';
    }
  };

  const isPassword = type === 'password';
  return (
    <View style={{marginBottom: 16}}>
      {label && (
        <View style={{flexDirection: 'row', marginBottom: 8}}>
          <AppText
            variant="bodySmall"
            style={{
              fontFamily: fonts.semiBold,
            }}>
            {label}
          </AppText>
          {required && (
            <AppText
              variant="bodySmall"
              color={colors.error}
              style={{
                fontFamily: fonts.semiBold,
                marginLeft: 3,
              }}>
              *
            </AppText>
          )}
        </View>
      )}
      <View
        style={{
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: hasError ? colors.error : colors.border,
          borderRadius: 12,
          backgroundColor: isFilled
            ? colors.surfaceLight
            : colors.surface,
          paddingHorizontal: 14,
        }}>
        {leftIcon && (
          <Pressable
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            hitSlop={10}
            style={{
              marginRight: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {leftIcon}
          </Pressable>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={getKeyboardType()}
          secureTextEntry={isPassword}
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontFamily: fonts.regular,
            fontSize: 16,
            paddingVertical: 0,
          }}
          {...props}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={10}
            style={{
              marginLeft: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {rightIcon}
          </Pressable>
        )}
      </View>

      {hasError && (
        <AppText
          variant="caption"
          color={colors.error}
          style={{
            marginTop: 6,
          }}>
          {error}
        </AppText>
      )}
    </View>
  );
};

export default AppInput;
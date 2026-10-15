import React from 'react';
import {View} from 'react-native';
import {OtpInput} from 'react-native-otp-entry';
import AppText from './AppText';
import {fonts} from '../../theme';
import {useTheme} from '../../context/ThemeContext';

const AppOtpInput = ({
  value = '',
  onChangeText,
  onFilled,
  error,
  length = 6,
  disabled = false,
  autoFocus = true,
}) => {
  const {colors} = useTheme();

  return (
    <View>
      <OtpInput
        numberOfDigits={length}
        autoFocus={autoFocus}
        type="numeric"
        disabled={disabled}
        onTextChange={onChangeText}
        onFilled={onFilled}
        textInputProps={{
          accessibilityLabel: 'One-Time Password',
          autoComplete: 'one-time-code',
          textContentType: 'oneTimeCode',
        }}
        textProps={{
          allowFontScaling: false,
          accessibilityRole: 'text',
          accessibilityLabel: 'OTP digit',
        }}
        theme={{
          containerStyle: {
            width: '100%',
            justifyContent: 'space-between',
          },
          pinCodeContainerStyle: {
            width: 48,
            height: 56,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.surface,
          },
          focusedPinCodeContainerStyle: {
            borderColor: error ? colors.error : colors.primary,
            backgroundColor: colors.surfaceLight,
          },
          filledPinCodeContainerStyle: {
            borderColor: error ? colors.error : colors.primary,
            backgroundColor: colors.surfaceLight,
          },
          disabledPinCodeContainerStyle: {
            opacity: 0.5,
            backgroundColor: colors.surface,
          },
          pinCodeTextStyle: {
            color: colors.textPrimary,
            fontFamily: fonts.semiBold,
            fontSize: 22,
          },
          focusStickStyle: {
            backgroundColor: colors.primary,
            height: 24,
          },
        }}
      />

      {error && (
        <AppText
          variant="caption"
          color={colors.error}
          style={{
            marginTop: 8,
          }}>
          {error}
        </AppText>
      )}
    </View>
  );
};

export default AppOtpInput;
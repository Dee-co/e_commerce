import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import AppOtpInput from '../../components/ui/AppOtpInput';
import AppButton from '../../components/ui/AppButton';
import { fonts } from '../../theme';
import { verifyOtp, resendOtp } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
const VerifyOtpScreen = ({ navigation, route }) => {
  const { colors } = useTheme();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(600);
  const [resendSeconds, setResendSeconds] = useState(30);
  const [error, setError] = useState('');

  const phone = route?.params?.phone || '';

  useEffect(() => {
    if (expirySeconds <= 0) return;

    const timer = setTimeout(() => {
      setExpirySeconds(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [expirySeconds]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setTimeout(() => {
      setResendSeconds(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  };

  const handleVerifyOtp = async () => {
    if (!phone.trim()) {
      setError('Mobile number is missing. Please go back and try again.');
      return;
    }

    if (expirySeconds === 0) {
      setError('Your OTP has expired. Please request a new code.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }navigation.replace('Main');
    // try {
    //   setLoading(true);
    //   setError('');

    //   // Update authService/backend to accept phone + otp.
    //   const response = await verifyOtp({
    //     phone: phone.trim(),
    //     otp,
    //   });

    //   console.log('VERIFY OTP RESPONSE:', response);

    //   Toast.show({
    //     type: 'success',
    //     text1: 'Mobile Verified',
    //     text2: 'Your mobile number has been verified successfully.',
    //   });

    //   navigation.reset({
    //     index: 0,
    //     routes: [{ name: 'MainTabs' }],
    //   });
    // } catch (err) {
    //   console.log('VERIFY OTP ERROR:', err?.response?.data || err?.message);

    //   const message =
    //     err?.response?.data?.message ||
    //     'Unable to verify OTP. Please try again.';

    //   setError(Array.isArray(message) ? message.join(', ') : message);
    //   setOtp('');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleResendOtp = async () => {
    if (resendSeconds > 0 || resendLoading || !phone.trim()) {
      return;
    }

    try {
      setResendLoading(true);
      setError('');

      // Update authService/backend to accept a phone number.
      const response = await resendOtp(phone.trim());

      console.log('RESEND OTP RESPONSE:', response);

      setResendSeconds(30);
      setExpirySeconds(600);
      setOtp('');

      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'A new verification code has been sent to your mobile.',
      });
    } catch (err) {
      console.log('RESEND OTP ERROR:', err?.response?.data || err?.message);

      const responseMessage =
        err?.response?.data?.message ||
        'Unable to resend OTP. Please try again.';

      const message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : responseMessage;

      setError(message);

      const match = message.match(/wait (\d+) seconds/i);

      if (match) {
        setResendSeconds(Number(match[1]));
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AppSafeAreaView>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 py-8">
          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            className="mb-8 h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surfaceLight }}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>

          {/* Header */}
          <View className="mb-8 items-center">
            <View
              className="mb-5 h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ backgroundColor: colors.primary }}
            >
              <Smartphone size={28} color={colors.black} strokeWidth={2.2} />
            </View>

            <AppText
              variant="heading"
              className="text-center"
              style={{ color: colors.textPrimary }}
            >
              Verify your mobile
            </AppText>

            <AppText
              variant="body"
              color={colors.textSecondary}
              className="mt-2 text-center"
            >
              We've sent a 6-digit verification code to
            </AppText>

            <AppText
              variant="bodySmall"
              color={colors.textPrimary}
              className="mt-1 text-center"
              style={{ fontFamily: fonts.semiBold }}
            >
              {phone ? `+91 ${phone}` : 'Mobile number unavailable'}
            </AppText>
          </View>

          {/* OTP Card */}
          <View
            className="rounded-[20px] border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <AppText
              variant="bodySmall"
              color={colors.textSecondary}
              className="mb-4 text-center"
            >
              Enter the verification code
            </AppText>

            <AppOtpInput
              value={otp}
              onChangeText={value => {
                setOtp(value);
                setError('');
              }}
              onFilled={code => {
                setOtp(code);
                setError('');
              }}
            />

            {error ? (
              <AppText
                variant="caption"
                color={colors.error}
                className="mt-3 text-center"
              >
                {error}
              </AppText>
            ) : null}

            {/* Expiry Timer */}
            <View className="mt-6 items-center">
              <AppText variant="bodySmall" color={colors.textSecondary}>
                Code expires in{' '}
                <AppText
                  variant="bodySmall"
                  color={expirySeconds === 0 ? colors.error : colors.primary}
                  style={{ fontFamily: fonts.semiBold }}
                >
                  {formatTime(expirySeconds)}
                </AppText>
              </AppText>
            </View>

            {/* Resend OTP */}
            <View className="mt-4 flex-row items-center justify-center">
              <AppText variant="bodySmall" color={colors.textSecondary}>
                Didn't receive the code?{' '}
              </AppText>

              <Pressable
                onPress={handleResendOtp}
                disabled={resendSeconds > 0 || resendLoading}
                hitSlop={8}
              >
                <AppText
                  variant="bodySmall"
                  color={
                    resendSeconds > 0 || resendLoading
                      ? colors.textMuted
                      : colors.primary
                  }
                  style={{ fontFamily: fonts.semiBold }}
                >
                  {resendLoading
                    ? 'Sending...'
                    : resendSeconds > 0
                    ? `Resend in ${resendSeconds}s`
                    : 'Resend'}
                </AppText>
              </Pressable>
            </View>

            {/* Verify Button */}
            <View className="mt-6">
              <AppButton
                title={loading ? 'Verifying...' : 'Verify Mobile'}
                loading={loading}
                disabled={otp.length !== 6 || loading || expirySeconds === 0}
                rightIcon={
                  <ArrowRight
                    size={20}
                    color={colors.black}
                    strokeWidth={2.5}
                  />
                }
                onPress={handleVerifyOtp}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  );
};

export default VerifyOtpScreen;

import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import AppInput from '../../components/ui/AppInput';
import AppText from '../../components/ui/AppText';
import { useTheme } from '../../context/ThemeContext';
import AppSafeAreaView from '../../components/ui/AppSafeAreaView';

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const handleContinue = () => {
    if (!phone.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    navigation.replace('VerifyOtp', {
      phone,
    });
  };

  return (
    <AppSafeAreaView>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 5,
          paddingBottom: 24,
        }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="mb-8 h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <AppText
              className="text-2xl font-extrabold"
              style={{ color: colors.black }}
            >
              APP
            </AppText>
          </View>
          <AppText
            className="text-3xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Welcome back!
          </AppText>

          <AppText
            className="mt-3 text-base"
            style={{ color: colors.textSecondary }}
          >
            Enter your mobile number to continue.
          </AppText>

          {/* Phone Input */}
          <View className="mt-8">
            <AppInput
              label="Mobile number"
              required
              type="phone"
              value={phone}
              onChangeText={value => {
                setPhone(value.replace(/\D/g, '').slice(0, 10));
                if (error) setError('');
              }}
              placeholder="Enter mobile number"
              maxLength={10}
              error={error}
              leftIcon={
                <AppText
                  variant="body"
                  style={{
                    color: colors.textPrimary,
                    fontWeight: '600',
                  }}
                >
                  +91
                </AppText>
              }
            />
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            className="mt-2 items-center rounded-xl py-4"
            style={{ backgroundColor: colors.primary }}
          >
            <AppText
              className="text-base font-bold"
              style={{ color: colors.black }}
            >
              Continue
            </AppText>
          </Pressable>

          {/* Terms */}
          <AppText
            className="mt-5 text-center text-xs"
            style={{ color: colors.textMuted }}
          >
            By continuing, you agree to our Terms & Privacy Policy.
          </AppText>
        </ScrollView>
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  );
};

export default LoginScreen;

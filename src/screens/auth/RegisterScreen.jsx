import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Mail, Lock, Eye, ArrowLeft, ArrowRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { fonts } from '../../theme';
import { registerUser } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

const RegisterScreen = ({ navigation }) => {
  const {colors} = useTheme()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
        general: '',
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirmPassword = form.confirmPassword;
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      setErrors(prev => ({
        ...prev,
        general: '',
      }));
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };
      console.log('REGISTER PAYLOAD:', payload);
      const response = await registerUser(payload);
      console.log('REGISTER RESPONSE:', response);
      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: 'OTP has been sent to your email.',
      });
      navigation.navigate('VerifyOtp', {
        email: payload.email,
      });
    } catch (error) {
      console.log('REGISTER ERROR:', error?.response?.data || error?.message);
      const responseData = error?.response?.data;
      const message =
        responseData?.message || 'Unable to create account. Please try again.';
      setErrors(prev => ({
        ...prev,
        general: message,
      }));
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: message,
      });
    } finally {
      setLoading(false);
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
        <View className="flex-1 justify-center py-8">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            className="w-10 h-10 rounded-xl bg-surfaceLight items-center justify-center mb-6"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <View className="items-center mb-7">
            <View className="w-16 h-16 rounded-[20px] bg-primary items-center justify-center mb-5">
              <Lock size={28} color={colors.black} strokeWidth={2.2} />
            </View>
            <AppText variant="heading" className="text-center">
              Create account
            </AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              className="text-center mt-2"
            >
              Join PadosiPro and discover local services
            </AppText>
          </View>
          <View className="bg-surface rounded-[20px] border border-border p-5">
            {!!errors.general && (
              <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                <AppText variant="bodySmall" color={colors.error}>
                  {errors.general}
                </AppText>
              </View>
            )}
            <AppInput
              label="Email"
              required
              type="email"
              value={form.email}
              onChangeText={value => handleChange('email', value)}
              placeholder="Enter your email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              leftIcon={<Mail size={20} color={colors.textSecondary} />}
              error={errors.email}
            />
            <AppInput
              label="Password"
              required
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChangeText={value => handleChange('password', value)}
              placeholder="Create a password"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              rightIcon={
                <Eye
                  size={20}
                  color={showPassword ? colors.primary : colors.textSecondary}
                />
              }
              onRightIconPress={() => setShowPassword(prev => !prev)}
              error={errors.password}
            />
            <AppInput
              label="Confirm Password"
              required
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChangeText={value => handleChange('confirmPassword', value)}
              placeholder="Confirm your password"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              rightIcon={
                <Eye
                  size={20}
                  color={
                    showConfirmPassword ? colors.primary : colors.textSecondary
                  }
                />
              }
              onRightIconPress={() => setShowConfirmPassword(prev => !prev)}
              error={errors.confirmPassword}
            />
            <AppButton
              title={loading ? 'Creating Account...' : 'Create Account'}
              loading={loading}
              disabled={loading}
              rightIcon={
                !loading && (
                  <ArrowRight
                    size={20}
                    color={colors.black}
                    strokeWidth={2.5}
                  />
                )
              }
              onPress={handleRegister}
            />
          </View>
          <View className="flex-row justify-center items-center mt-7">
            <AppText variant="bodySmall" color={colors.textSecondary}>
              Already have an account?
            </AppText>
            <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
              <AppText
                variant="bodySmall"
                color={colors.primary}
                style={{
                  fontFamily: fonts.semiBold,
                }}
              >
                Login
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  );
};
export default RegisterScreen;

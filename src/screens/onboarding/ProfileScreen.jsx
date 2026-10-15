import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

import {
  User,
  Phone,
  MapPin,
  BriefcaseBusiness,
  ArrowRight,
} from 'lucide-react-native'
import Toast from 'react-native-toast-message';
import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import {updateProfile} from '../../services/authService';
import {useAuth} from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
const ProfileScreen = ({navigation, route}) => {
  const {colors} = useTheme()
  const {user, updateUser} = useAuth();
  const isEditMode = route?.params?.isEditMode === true;
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    mobile: '',
    address: '',
    general: '',
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.name || '');
    setMobile(user.mobile || '');
    setAddress(user.address || '');
    setBusinessName(user.businessName || '');
  }, [user]);
  const handleMobileChange = value => {
    const digitsOnly = value.replace(/\D/g, '');
    setMobile(digitsOnly);
    if (errors.mobile) {
      setErrors(prev => ({
        ...prev,
        mobile: '',
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {
      name: '',
      mobile: '',
      address: '',
      general: '',
    };
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedAddress = address.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Please enter a valid name.';
    }
    if (!trimmedMobile) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(trimmedMobile)) {
      newErrors.mobile =
        'Please enter a valid 10-digit mobile number.';
    }
    if (!trimmedAddress) {
      newErrors.address = 'Address is required.';
    }
    setErrors(newErrors);
    return !(
      newErrors.name ||
      newErrors.mobile ||
      newErrors.address
    );
  };
  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      setErrors(prev => ({
        ...prev,
        general: '',
      }));
      const profileData = {
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        businessName: businessName.trim() || null,
      };
      const response = await updateProfile(profileData);
      console.log('PROFILE RESPONSE:', response);
      await updateUser({
        ...profileData,
        ...(isEditMode
          ? {}
          : {
              isProfileCompleted: true,
            }),
      });
      Toast.show({
        type: 'success',
        text1: isEditMode
          ? 'Profile Updated'
          : 'Profile Saved',
        text2: isEditMode
          ? 'Your profile has been updated successfully.'
          : 'Your profile has been saved successfully.',
      });
      if (isEditMode) {
        navigation.goBack();
        return;
      }
      navigation.replace('TaskSelection');
    } catch (err) {
      console.log(
        'PROFILE ERROR:',
        err?.response?.data || err?.message,
      );
      const message =
        err?.response?.data?.message ||
        'Unable to update profile. Please try again.';
      setErrors(prev => ({
        ...prev,
        general: message,
      }));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AppSafeAreaView>
      <KeyboardAwareScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 32,
          paddingBottom: 60,
        }}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-[20px] bg-primary items-center justify-center mb-5">
            <User
              size={28}
              color={colors.black}
              strokeWidth={2.2}
            />
          </View>
          <AppText
            variant="heading"
            className="text-center">
            {isEditMode
              ? 'Edit your profile'
              : 'Complete your profile'}
          </AppText>
          <AppText
            variant="body"
            color={colors.textSecondary}
            className="text-center mt-2">
            {isEditMode
              ? 'Update your account details'
              : 'Tell us a little about yourself'}
          </AppText>
        </View>
        <View className="bg-surface rounded-[20px] border border-border p-5">
          <AppInput
            label="Full Name"
            required
            value={name}
            onChangeText={value => {
              setName(value);

              if (errors.name) {
                setErrors(prev => ({
                  ...prev,
                  name: '',
                }));
              }
            }}
            error={errors.name}
            placeholder="Enter your full name"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            leftIcon={
              <User
                size={20}
                color={colors.textSecondary}
              />
            }
          />
          <AppInput
            label="Mobile Number"
            required
            type="phone"
            value={mobile}
            onChangeText={handleMobileChange}
            error={errors.mobile}
            placeholder="Enter 10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="next"
            leftIcon={
              <Phone
                size={20}
                color={colors.textSecondary}
              />
            }
          />
          <AppInput
            label="Address"
            required
            value={address}
            onChangeText={value => {
              setAddress(value);

              if (errors.address) {
                setErrors(prev => ({
                  ...prev,
                  address: '',
                }));
              }
            }}
            error={errors.address}
            placeholder="Enter your address"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="next"
            leftIcon={
              <MapPin
                size={20}
                color={colors.textSecondary}
              />
            }
          />
          <AppInput
            label="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Optional"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            leftIcon={
              <BriefcaseBusiness
                size={20}
                color={colors.textSecondary}
              />
            }
          />
          {errors.general ? (
            <AppText
              variant="caption"
              color={colors.error}
              className="mb-4">
              {errors.general}
            </AppText>
          ) : null}
          <AppButton
            title={loading
              ? 'Saving...'
              : isEditMode
                ? 'Save Changes'
                : 'Continue'}
            loading={loading}
            disabled={loading}
            rightIcon={
              <ArrowRight
                size={20}
                color={colors.black}
                strokeWidth={2.5}
              />
            }
            onPress={handleContinue}
          />
        </View>
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  );
};
export default ProfileScreen;
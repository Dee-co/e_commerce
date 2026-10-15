import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  LogOut,
  Pencil,
} from 'lucide-react-native';

import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigation = useNavigation();
  const firstLetter = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logout();
          } catch (error) {
            console.log('LOGOUT ERROR:', error);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <AppSafeAreaView bottom={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <AppText variant="heading">Profile</AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={{ marginTop: 6 }}
            >
              Manage your account details
            </AppText>
          </View>
          <View className="w-11 h-11 rounded-xl bg-surfaceLight items-center justify-center border border-border">
            <UserRound size={21} color={colors.primary} />
          </View>
        </View>
        <View className="bg-surface border border-border rounded-2xl p-5 mt-7">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
              <AppText
                variant="heading"
                color={colors.black}
                style={{
                  fontSize: 26,
                  lineHeight: 32,
                }}
              >
                {firstLetter}
              </AppText>
            </View>
            <View className="flex-1 ml-4">
              <AppText variant="title">{user?.name || 'User'}</AppText>
              <AppText
                variant="bodySmall"
                color={colors.textSecondary}
                style={{ marginTop: 4 }}
              >
                {user?.email || 'No email'}
              </AppText>
            </View>
          </View>
        </View>
        <AppText
          variant="title"
          style={{
            marginTop: 28,
            marginBottom: 12,
          }}
        >
          Account information
        </AppText>
        <View className="bg-surface border border-border rounded-2xl overflow-hidden">
          <View className="flex-row items-center p-4 border-b border-border">
            <View className="w-10 h-10 rounded-xl bg-surfaceLight items-center justify-center">
              <Mail size={19} color={colors.primary} />
            </View>
            <View className="flex-1 ml-4">
              <AppText variant="caption" color={colors.textMuted}>
                Email
              </AppText>
              <AppText variant="body" style={{ marginTop: 2 }}>
                {user?.email || 'Not available'}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center p-4 border-b border-border">
            <View className="w-10 h-10 rounded-xl bg-surfaceLight items-center justify-center">
              <Phone size={19} color={colors.primary} />
            </View>
            <View className="flex-1 ml-4">
              <AppText variant="caption" color={colors.textMuted}>
                Mobile number
              </AppText>
              <AppText variant="body" style={{ marginTop: 2 }}>
                {user?.mobile ? `+91 ${user.mobile}` : 'Not available'}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-start p-4 border-b border-border">
            <View className="w-10 h-10 rounded-xl bg-surfaceLight items-center justify-center">
              <MapPin size={19} color={colors.primary} />
            </View>
            <View className="flex-1 ml-4">
              <AppText variant="caption" color={colors.textMuted}>
                Address
              </AppText>
              <AppText variant="body" style={{ marginTop: 2 }}>
                {user?.address || 'Not available'}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-xl bg-surfaceLight items-center justify-center">
              <BriefcaseBusiness size={19} color={colors.primary} />
            </View>
            <View className="flex-1 ml-4">
              <AppText variant="caption" color={colors.textMuted}>
                Business name
              </AppText>
              <AppText variant="body" style={{ marginTop: 2 }}>
                {user?.businessName || 'Not added'}
              </AppText>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <AppButton
            title="Edit Profile"
            variant="outline"
            leftIcon={<Pencil size={18} color={colors.primary} />}
            onPress={() =>
              navigation.navigate('EditProfile', {
                isEditMode: true,
              })
            }
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <AppButton
            title={loggingOut ? 'Logging out...' : 'Logout'}
            variant="danger"
            loading={loggingOut}
            disabled={loggingOut}
            leftIcon={
              !loggingOut ? (
                <LogOut size={19} color={colors.textPrimary} />
              ) : null
            }
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default ProfileScreen;

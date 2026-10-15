import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
  const restoreSession = async () => {
    try {
      const storedAccessToken =
        await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

      const storedRefreshToken =
        await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      const storedUser =
        await AsyncStorage.getItem(USER_KEY);

      if (storedAccessToken && storedRefreshToken && storedUser) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('RESTORE SESSION ERROR:', error);
    } finally {
      setIsLoading(false);
    }
  };

  restoreSession();
}, []);
  const login = async ({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: newUser,
  }) => {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);
    } catch (error) {
      console.error('Failed to save auth session:', error);
      throw error;
    }
  };
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  const updateUser = async updates => {
    try {
      const updatedUser = {
        ...user,
        ...updates,
      };

      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };
  const isAuthenticated = Boolean(accessToken);

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [accessToken, refreshToken, user, isAuthenticated, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

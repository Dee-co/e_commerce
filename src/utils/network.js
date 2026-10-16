import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
const isOfflineState = state =>
  state.isConnected === false || state.isInternetReachable === false;

export const isDeviceOffline = async () => isOfflineState(await NetInfo.fetch());

export const useNetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(isOfflineState(state));
    });

    return unsubscribe;
  }, []);

  return { isOffline };
};
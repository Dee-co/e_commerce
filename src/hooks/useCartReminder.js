import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useSelector } from 'react-redux';

import {
  cancelCartReminder,
  requestNotificationPermission,
  scheduleCartReminder,
} from '../services/notificationService';

const selectItemCount = state =>
  state.cart.items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

export const useCartReminder = () => {
  const itemCount = useSelector(selectItemCount);
  const hasItems = itemCount > 0;
  const itemCountRef = useRef(itemCount);

  itemCountRef.current = itemCount;
  useEffect(() => {
    cancelCartReminder();
  }, []);
  useEffect(() => {
    if (hasItems) {
      requestNotificationPermission();
    }
  }, [hasItems]);
  useEffect(() => {
    if (!hasItems) {
      cancelCartReminder();
    }
  }, [hasItems]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        cancelCartReminder();
        return;
      }

      if (nextState === 'background' && itemCountRef.current > 0) {
        scheduleCartReminder(itemCountRef.current);
      }
    });

    return () => subscription.remove();
  }, []);
};